import React, { useRef, useEffect } from 'react';
import { 
  Check, 
  Star, 
  Archive, 
  Trash2, 
  Edit3, 
  Save, 
  X,
  Calendar,
  Tag
} from 'lucide-react';
import { styles } from './styles';
import { priorities } from './constants';
import { isOverdue } from './utils';

const TaskItem = ({
  task,
  editingTask,
  editingText,
  setEditingText,
  saveEdit,
  cancelEdit,
  toggleComplete,
  startEdit,
  toggleImportant,
  archiveTask,
  deleteTask,
  handleDragStart,
  handleDragOver,
  handleDrop,
  draggedTask
}) => {
  const editInputRef = useRef(null);
  
  // Use _id for MongoDB tasks, fallback to id for compatibility
  const taskId = task._id || task.id;
  const isEditing = editingTask === taskId;
  return (
    <div
      key={taskId}
      draggable={!isEditing}
      onDragStart={(e) => !isEditing && handleDragStart(e, task)}
      onDragOver={handleDragOver}
      onDrop={(e) => !isEditing && handleDrop(e, task)}
      style={{
        ...styles.taskItem,
        opacity: draggedTask && (draggedTask._id || draggedTask.id) === taskId ? 0.5 : 1,
        borderLeft: `4px solid ${task.completed ? '#D1D5DB' : (priorities?.find(p => p.id === task.priority)?.color || '#D1D5DB')}`,
      }}
    >
      {isEditing ? (
        <div style={styles.taskContent}>
          <input
            ref={editInputRef}
            type="text"
            value={editingText}
            onChange={(e) => setEditingText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                saveEdit();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                cancelEdit();
              }
            }}
            style={styles.editInput}
            placeholder="Enter task text..."
          />
          <div style={styles.editActions}>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                console.log('Save button clicked in TaskItem');
                saveEdit();
              }} 
              style={{...styles.actionButton, color: '#10B981'}}
              title="Save changes"
            >
              <Check style={{ width: '18px', height: '18px' }} />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                console.log('Cancel button clicked in TaskItem');
                cancelEdit();
              }} 
              style={{...styles.actionButton, color: '#EF4444'}}
              title="Cancel editing"
            >
              <X style={{ width: '18px', height: '18px' }} />
            </button>
          </div>
        </div>
      ) : (
        <div style={styles.taskContent}>
          <div
            onClick={(e) => {
              e.stopPropagation();
              toggleComplete(taskId);
            }}
            style={{
              ...styles.checkbox,
              ...(task.completed ? styles.checkboxCompleted : styles.checkboxIncomplete)
            }}
          >
            {task.completed && <Check style={{ width: '12px', height: '12px' }} />}
          </div>
          <div style={styles.taskInfo}>
            <p style={{
              ...styles.taskText,
              ...(task.completed ? styles.taskTextCompleted : styles.taskTextNormal)
            }}>{task.text}</p>
            <div style={styles.taskMeta}>
              {task.dueDate && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px', 
                  color: isOverdue && isOverdue(task.dueDate) && !task.completed ? '#EF4444' : '#6B7280' 
                }}>
                  <Calendar style={{ width: '14px', height: '14px' }} />
                  <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              )}
              {task.tags && task.tags.map(tag => (
                <span key={tag} style={styles.tag}>{tag}</span>
              ))}
            </div>
          </div>
          <div style={styles.taskActions}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleImportant(taskId);
              }}
              style={{
                ...styles.actionButton,
                color: task.important ? '#F59E0B' : '#9CA3AF'
              }}
              title={task.important ? 'Remove from important' : 'Mark as important'}
            >
              <Star style={{ width: '16px', height: '16px', fill: task.important ? '#F59E0B' : 'none' }} />
            </button>
            
            {/* FIXED EDIT BUTTON */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                console.log('Edit button clicked for task:', task);
                console.log('Task ID:', taskId);
                startEdit(task);
              }} 
              style={styles.actionButton}
              title="Edit task"
            >
              <Edit3 style={{ width: '16px', height: '16px' }} />
            </button>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                archiveTask(taskId);
              }} 
              style={styles.actionButton}
              title={task.archived ? 'Unarchive task' : 'Archive task'}
            >
              <Archive style={{ width: '16px', height: '16px' }} />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Are you sure you want to delete this task?')) {
                  deleteTask(taskId);
                }
              }} 
              style={{...styles.actionButton, color: '#EF4444'}}
              title="Delete task"
            >
              <Trash2 style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskItem;