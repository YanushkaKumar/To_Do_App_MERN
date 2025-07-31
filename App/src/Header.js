import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { styles } from './styles';

const Header = ({
  stats,
  searchQuery,
  setSearchQuery,
  showFilters,
  setShowFilters,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode
}) => {
  return (
    <div style={styles.header}>
      <div style={styles.headerTop}>
        <div>
          <h1 style={styles.title}>Tasks</h1>
          <p style={styles.subtitle}>Manage your daily activities efficiently</p>
        </div>
        <div style={styles.searchContainer}>
          <div style={styles.searchInput}>
            <Search style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchField}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              ...styles.filterButton,
              ...(showFilters ? styles.filterButtonActive : styles.filterButtonInactive)
            }}
          >
            <Filter style={{ width: '20px', height: '20px' }} />
          </button>
        </div>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statNumber, color: '#111827' }}>{stats.activeTasks}</div>
          <div style={styles.statLabel}>Active Tasks</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statNumber, color: '#059669' }}>{stats.completedTasks}</div>
          <div style={styles.statLabel}>Completed</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statNumber, color: '#D97706' }}>{stats.importantTasks}</div>
          <div style={styles.statLabel}>Important</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statNumber, color: '#2563EB' }}>{stats.todayTasks}</div>
          <div style={styles.statLabel}>Due Today</div>
        </div>
      </div>

      {showFilters && (
        <div style={styles.filtersPanel}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ ...styles.sidebarTitle, marginBottom: 0 }}>Filters & Sort</h3>
            <button
              onClick={() => setShowFilters(false)}
              style={{ ...styles.actionButton, color: '#9CA3AF' }}
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div>
              <label style={styles.label}>Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ ...styles.input, marginBottom: 0, width: 'auto' }}
              >
                <option value="created">Created Date</option>
                <option value="priority">Priority</option>
                <option value="dueDate">Due Date</option>
              </select>
            </div>
            <div>
              <label style={styles.label}>View Mode</label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                style={{ ...styles.input, marginBottom: 0, width: 'auto' }}
              >
                <option value="list">List View</option>
                <option value="kanban" disabled>Kanban Board (WIP)</option>
                <option value="calendar" disabled>Calendar View (WIP)</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;