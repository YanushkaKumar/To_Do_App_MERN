import React, { useRef, useEffect } from 'react';
import { styles } from './styles';
import { priorities, predefinedTags } from './constants';

const AddTaskForm = ({
  newTask,
  setNewTask,
  selectedPriority,
  setSelectedPriority,
  dueDate,
  setDueDate,
  selectedTags,
  toggleTag,
  addTask,
  setShowAddForm
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div style={styles.addForm}>
      <form onSubmit={addTask}>
        <h3 style={styles.formTitle}>Add a new task</h3>
        <input
          ref={inputRef}
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="e.g., Learn about React Hooks"
          style={styles.input}
        />
        <div style={styles.formGrid}>
          <div>
            <label style={styles.label}>Priority</label>
            <div style={styles.priorityButtons}>
              {priorities.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPriority(p.id)}
                  style={{
                    ...styles.priorityButton,
                    background: selectedPriority === p.id ? p.color : '#F3F4F6',
                    color: selectedPriority === p.id ? 'white' : '#374151'
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="dueDate" style={styles.label}>Due Date</label>
            <input
              type="date"
              id="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={{ ...styles.input, marginBottom: 0 }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={styles.label}>Tags</label>
          <div style={styles.tagContainer}>
            {predefinedTags.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                style={{
                  ...styles.tagButton,
                  ...(selectedTags.includes(tag) ? styles.tagActive : styles.tagInactive)
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.formButtons}>
          <button type="submit" style={styles.submitButton}>
            Add Task
          </button>
          <button
            type="button"
            onClick={() => setShowAddForm(false)}
            style={styles.cancelButton}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTaskForm;