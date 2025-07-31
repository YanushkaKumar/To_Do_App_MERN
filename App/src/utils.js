export const getFilteredTasks = (tasks, selectedCategory, searchQuery, sortBy) => {
  let filtered = tasks.filter(task => {
    if (selectedCategory === 'today') {
      const today = new Date().toISOString().split('T')[0];
      return task.dueDate === today && !task.archived;
    }
    if (selectedCategory === 'important') return task.important && !task.archived;
    if (selectedCategory === 'completed') return task.completed && !task.archived;
    if (selectedCategory === 'archived') return task.archived;
    if (selectedCategory === 'all') return !task.archived;
    
    return true;
  });

  if (searchQuery) {
    filtered = filtered.filter(task => 
      task.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }

  filtered.sort((a, b) => {
    if (sortBy === 'created') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    }
    if (sortBy === 'dueDate') {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    return 0;
  });

  return filtered;
};

export const getTaskStats = (tasks) => {
  const activeTasks = tasks.filter(t => !t.completed && !t.archived);
  const completedTasks = tasks.filter(t => t.completed && !t.archived);
  const importantTasks = tasks.filter(t => t.important && !t.archived);
  const todayTasks = tasks.filter(t => {
    const today = new Date().toISOString().split('T')[0];
    return t.dueDate === today && !t.archived;
  });

  return { activeTasks: activeTasks.length, completedTasks: completedTasks.length, importantTasks: importantTasks.length, todayTasks: todayTasks.length };
};

export const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dueDate) < today;
};