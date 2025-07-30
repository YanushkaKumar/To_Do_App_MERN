import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./TaskStyles.css";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const api = axios.create({
    baseURL: "http://localhost:5000",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  
  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/tasks");
      setTasks(res.data);
      setError("");
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Failed to load tasks. Please try again.");
      if (err.response && err.response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/";
      }
    } finally {
      setIsLoading(false);
    }
  };

 
  useEffect(() => {
    fetchTasks();
  }, []); 


  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
  
    try {
      const res = await api.post("/tasks", { text: newTask });
  
      setTasks((prevTasks) => [...prevTasks, res.data]); 
      setNewTask(""); 
    } catch (err) {
      console.error("Error adding task:", err);
      setError(err.response?.data?.error || "Failed to add task. Please try again.");
    }
  };
  
  

  const toggleComplete = async (id, completed) => {
    try {
      await api.put(`/tasks/${id}`, { completed: !completed });
      setTasks(tasks.map(task => 
        task._id === id ? { ...task, completed: !completed } : task
      ));
    } catch (err) {
      setError("Failed to update task. Please try again.");
    }
  };
  

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter(task => task._id !== id));
    } catch (err) {
      setError("Failed to delete task. Please try again.");
    }
  };
  
  
  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true; 
  });
  
 
  const activeTasks = tasks.filter(task => !task.completed).length;
  const completedTasks = tasks.length - activeTasks;
  
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div className="tasks-container">
      <div className="tasks-header">
        <h1>My Todo List</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="task-card">
        {}
        <form onSubmit={addTask} className="task-form">
          <input
            type="text"
            placeholder="Add a new task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="task-input"
          />
          <button type="submit" className="add-btn">Add Task</button>
        </form>
        
        {}
        <div className="task-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({tasks.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active ({activeTasks})
          </button>
          <button 
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed ({completedTasks})
          </button>
        </div>
        
        {}
        <div className="tasks-list">
          {isLoading ? (
            <div className="loading-spinner">Loading tasks...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="empty-state">
              <p>{filter === 'all' 
                ? "Your task list is empty. Add a task to get started!" 
                : `No ${filter} tasks found.`}
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div 
                key={task._id} 
                className={`task-item ${task.completed ? 'completed' : ''}`}
              >
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleComplete(task._id, task.completed)}
                  />
                  <span className="checkmark"></span>
                </label>
                <span className="task-text">{task.text}</span>
                <div className="task-date">
                  {new Date(task.createdAt).toLocaleDateString()}
                </div>
                <button 
                  className="delete-btn"
                  onClick={() => deleteTask(task._id)}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
        
        {}
        {tasks.length > 0 && (
          <div className="task-summary">
            <p>
              {activeTasks} tasks left to complete
              {completedTasks > 0 && ` • ${completedTasks} completed`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Tasks;