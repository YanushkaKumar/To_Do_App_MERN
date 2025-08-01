import React, { useState, useEffect } from 'react';
import { Target } from 'lucide-react';

import { styles } from './styles';
import { getFilteredTasks, getTaskStats } from './utils';

import Header from './Header';
import Sidebar from './Sidebar';
import AddTaskForm from './AddTaskForm';
import TaskItem from './TaskItem';

// API Configuration - Update these if your backend uses different settings
const API_BASE_URL = 'http://localhost:5000';
const API_ENDPOINTS = {
  tasks: `${API_BASE_URL}/tasks`,
};

const AdvancedTodoApp = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [dueDate, setDueDate] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);
  const [sortBy, setSortBy] = useState('created');
  const [viewMode, setViewMode] = useState('list');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Get auth token - FIXED: Handle case where localStorage might not be available
  const getAuthToken = () => {
    try {
      return localStorage.getItem('token');
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return null;
    }
  };

  // API headers with auth
  const getHeaders = (includeContentType = false) => {
    const headers = {
      'Authorization': `Bearer ${getAuthToken()}`,
    };
    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  };

  // Fetch tasks from backend
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError('');
        
        const token = getAuthToken();
        if (!token) {
          setError('No authentication token found. Please login.');
          setLoading(false);
          return;
        }
        
        console.log('Fetching tasks from:', API_ENDPOINTS.tasks);
        
        const response = await fetch(API_ENDPOINTS.tasks, {
          headers: getHeaders(),
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
          if (response.status === 401) {
            setError('Authentication failed. Please login again.');
          } else if (response.status === 404) {
            setError('Tasks endpoint not found. Please check if your backend server is running and the API endpoint exists.');
          } else {
            setError(`Failed to fetch tasks: ${response.status} ${response.statusText}`);
          }
          setLoading(false);
          return;
        }

        const fetchedTasks = await response.json();
        console.log('Fetched tasks:', fetchedTasks);
        setTasks(Array.isArray(fetchedTasks) ? fetchedTasks : []);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          setError('Cannot connect to server. Please check if your backend is running on http://localhost:5000');
        } else {
          setError('Network error. Please check your connection and server status.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Add new task
  const addTask = async (e) => {
    if (e) e.preventDefault();
    if (!newTask.trim()) return;

    const taskData = {
      text: newTask,
      priority: selectedPriority || 'medium',
      tags: selectedTags,
      dueDate,
    };

    try {
      const token = getAuthToken();
      if (!token) {
        setError('No authentication token found. Please login.');
        return;
      }

      const response = await fetch(API_ENDPOINTS.tasks, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to add task: ${response.statusText}`);
      }

      const savedTask = await response.json();
      setTasks(prev => [savedTask, ...prev]);
      
      // Reset form
      setNewTask('');
      setSelectedPriority('');
      setSelectedTags([]);
      setDueDate('');
      setShowAddForm(false);
      setError('');
    } catch (error) {
      console.error('Error adding task:', error);
      setError(error.message || 'Failed to add task. Please try again.');
    }
  };
  
  // Toggle tag selection
  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Toggle task completion
  const toggleComplete = async (id) => {
    const task = tasks.find(t => t._id === id);
    if (!task) return;
  
    try {
      const token = getAuthToken();
      if (!token) {
        setError('No authentication token found. Please login.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify({ completed: !task.completed }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update task: ${response.statusText}`);
      }
  
      const updatedTask = await response.json();
      setTasks(prev => prev.map(t => (t._id === id ? updatedTask : t)));
      setError('');
    } catch (error) {
      console.error('Error toggling task completion:', error);
      setError(error.message || 'Failed to update task completion. Please try again.');
    }
  };

  // Delete task
  const deleteTask = async (id) => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError('No authentication token found. Please login.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete task: ${response.statusText}`);
      }

      setTasks(prev => prev.filter(task => task._id !== id));
      setError('');
    } catch (error) {
      console.error('Error deleting task:', error);
      setError(error.message || 'Failed to delete task. Please try again.');
    }
  };

  // FIXED: Start editing task - now properly handles the task object
  const startEdit = (task) => {
    console.log('Starting edit for task:', task);
    setEditingTask(task._id);
    setEditingText(task.text);
  };

  // FIXED: Save edited task - improved error handling and validation
  const saveEdit = async () => {
    if (!editingText.trim()) {
      setError('Task text cannot be empty');
      return;
    }
    
    if (!editingTask) {
      setError('No task selected for editing');
      return;
    }
    
    try {
      const token = getAuthToken();
      if (!token) {
        setError('No authentication token found. Please login.');
        return;
      }

      console.log('Saving edit for task ID:', editingTask);
      console.log('New text:', editingText);

      const response = await fetch(`${API_BASE_URL}/tasks/${editingTask}`, {
        method: 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify({ text: editingText.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update task: ${response.statusText}`);
      }

      const updatedTask = await response.json();
      console.log('Updated task received:', updatedTask);
      
      setTasks(prev => prev.map(task => (task._id === editingTask ? updatedTask : task)));
      
      // Clear editing state
      setEditingTask(null);
      setEditingText('');
      setError('');
      
      console.log('Edit saved successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      setError(error.message || 'Failed to update task. Please try again.');
    }
  };

  // Archive task
  const archiveTask = async (id) => {
    const task = tasks.find(t => t._id === id);
    if (!task) return;

    try {
      const token = getAuthToken();
      if (!token) {
        setError('No authentication token found. Please login.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify({ archived: !task.archived }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to archive task: ${response.statusText}`);
      }

      const updatedTask = await response.json();
      setTasks(prev => prev.map(t => (t._id === id ? updatedTask : t)));
      setError('');
    } catch (error) {
      console.error('Error archiving task:', error);
      setError(error.message || 'Failed to archive task. Please try again.');
      // Fallback to local state update if backend fails
      setTasks(prev => prev.map(task => task._id === id ? { ...task, archived: !task.archived } : task));
    }
  };

  // Toggle important
  const toggleImportant = async (id) => {
    const task = tasks.find(t => t._id === id);
    if (!task) return;

    try {
      const token = getAuthToken();
      if (!token) {
        setError('No authentication token found. Please login.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify({ important: !task.important }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update task importance: ${response.statusText}`);
      }

      const updatedTask = await response.json();
      setTasks(prev => prev.map(t => (t._id === id ? updatedTask : t)));
      setError('');
    } catch (error) {
      console.error('Error toggling task importance:', error);
      setError(error.message || 'Failed to update task importance. Please try again.');
      // Fallback to local state update if backend fails
      setTasks(prev => prev.map(task => task._id === id ? { ...task, important: !task.important } : task));
    }
  };

  // FIXED: Cancel editing - now clears all editing state
  const cancelEdit = () => {
    console.log('Canceling edit');
    setEditingTask(null);
    setEditingText('');
    setError(''); // Clear any edit-related errors
  };

  // Drag and drop handlers
  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetTask) => {
    e.preventDefault();
    if (!draggedTask || draggedTask._id === targetTask._id) return;
    
    const newTasks = [...tasks];
    const dragIndex = tasks.findIndex(t => t._id === draggedTask._id);
    const targetIndex = tasks.findIndex(t => t._id === targetTask._id);
    
    newTasks.splice(dragIndex, 1);
    newTasks.splice(targetIndex, 0, draggedTask);
    setTasks(newTasks);
    setDraggedTask(null);
  };

  // Calculate stats and filter tasks
  const stats = getTaskStats(tasks);
  const filteredTasks = getFilteredTasks(tasks, selectedCategory, searchQuery, sortBy);
  
  return (
    <div style={styles.container}>
      <div style={styles.main}>
        <Header 
          stats={stats} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          showFilters={showFilters} 
          setShowFilters={setShowFilters} 
          sortBy={sortBy} 
          setSortBy={setSortBy} 
          viewMode={viewMode} 
          setViewMode={setViewMode} 
        />
        
        <div style={styles.layout}>
          <Sidebar 
            setShowAddForm={setShowAddForm} 
            selectedCategory={selectedCategory} 
            setSelectedCategory={setSelectedCategory} 
          />
          
          <div style={styles.mainContent}>
            {error && (
              <div style={{ 
                padding: '12px', 
                marginBottom: '16px', 
                backgroundColor: '#fee2e2', 
                color: '#dc2626', 
                borderRadius: '6px',
                border: '1px solid #fecaca'
              }}>
                {error}
                <button 
                  onClick={() => setError('')}
                  style={{
                    marginLeft: '10px',
                    background: 'none',
                    border: 'none',
                    color: '#dc2626',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  ×
                </button>
              </div>
            )}

            {showAddForm && (
              <AddTaskForm 
                newTask={newTask} 
                setNewTask={setNewTask} 
                selectedPriority={selectedPriority} 
                setSelectedPriority={setSelectedPriority} 
                dueDate={dueDate} 
                setDueDate={setDueDate} 
                selectedTags={selectedTags} 
                toggleTag={toggleTag} 
                addTask={addTask} 
                setShowAddForm={setShowAddForm} 
              />
            )}
            
            <div style={styles.tasksContainer}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <p>Loading tasks...</p>
                </div>
              ) : filteredTasks.length > 0 ? (
                filteredTasks.map(task => (
                  <TaskItem
                    key={task._id} 
                    task={task}
                    editingTask={editingTask}
                    editingText={editingText}
                    setEditingText={setEditingText}
                    saveEdit={saveEdit}
                    cancelEdit={cancelEdit}
                    toggleComplete={() => toggleComplete(task._id)}
                    startEdit={() => startEdit(task)}
                    toggleImportant={() => toggleImportant(task._id)}
                    archiveTask={() => archiveTask(task._id)}
                    deleteTask={() => deleteTask(task._id)}
                    handleDragStart={(e) => handleDragStart(e, task)}
                    handleDragOver={handleDragOver}
                    handleDrop={(e) => handleDrop(e, task)}
                    draggedTask={draggedTask}
                  />
                ))
              ) : (
                <div style={styles.emptyState}>
                  <div style={styles.emptyStateIcon}><Target /></div>
                  <h3 style={styles.emptyStateTitle}>No Tasks Found</h3>
                  <p style={styles.emptyStateText}>
                    {searchQuery 
                      ? `No tasks match your search for "${searchQuery}".` 
                      : `There are no tasks in the "${selectedCategory}" category.`
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedTodoApp;