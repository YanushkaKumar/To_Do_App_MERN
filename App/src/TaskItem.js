import React, { useRef, useEffect } from 'react';
import { Trash2, Edit3, Check, X, Archive, Star, Calendar } from 'lucide-react';
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

  useEffect(() => {
    if (editingTask === task.id && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingTask, task.id]);

  return (
    <div
      key={task.id}
      draggable
      onDragStart={(e) => handleDragStart(e, task)}
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, task)}
      style={{
        ...styles.taskItem,
        opacity: draggedTask && draggedTask.id === task.id ? 0.5 : 1,
        borderLeft: `4px solid ${task.completed ? '#D1D5DB' : (priorities.find(p => p.id === task.priority)?.color || '#D1D5DB')}`,
      }}
    >
      {editingTask === task.id ? (
        <div style={styles.taskContent}>
          <input
            ref={editInputRef}
            type="text"
            value={editingText}
            onChange={(e) => setEditingText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
            style={styles.editInput}
          />
          <div style={styles.editActions}>
            <button onClick={saveEdit} style={{...styles.actionButton, color: '#10B981'}}>
              <Check style={{ width: '18px', height: '18px' }} />
            </button>
            <button onClick={cancelEdit} style={{...styles.actionButton, color: '#EF4444'}}>
              <X style={{ width: '18px', height: '18px' }} />
            </button>
          </div>
        </div>
      ) : (
        <div style={styles.taskContent}>
          <div
            onClick={() => toggleComplete(task.id)}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isOverdue(task.dueDate) && !task.completed ? '#EF4444' : '#6B7280' }}>
                  <Calendar style={{ width: '14px', height: '14px' }} />
                  <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              )}
              {task.tags.map(tag => (
                <span key={tag} style={styles.tag}>{tag}</span>
              ))}
            </div>
          </div>
          <div style={styles.taskActions}>
            <button
              onClick={() => toggleImportant(task.id)}
              style={{
                ...styles.actionButton,
                color: task.important ? '#F59E0B' : '#9CA3AF'
              }}
            >
              <Star style={{ width: '16px', height: '16px', fill: task.important ? '#F59E0B' : 'none' }} />
            </button>
            <button onClick={() => startEdit(task)} style={styles.actionButton}>
              <Edit3 style={{ width: '16px', height: '16px' }} />
            </button>
            <button onClick={() => archiveTask(task.id)} style={styles.actionButton}>
              <Archive style={{ width: '16px', height: '16px' }} />
            </button>
            <button onClick={() => deleteTask(task.id)} style={{...styles.actionButton, color: '#EF4444'}}>
              <Trash2 style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskItem;