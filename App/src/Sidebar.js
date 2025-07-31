import React from 'react';
import { Plus } from 'lucide-react';
import { styles } from './styles';
import { categories } from './constants';

const Sidebar = ({ setShowAddForm, selectedCategory, setSelectedCategory }) => {
  return (
    <div style={styles.sidebar}>
      <button
        onClick={() => setShowAddForm(true)}
        style={styles.addButton}
        onMouseOver={(e) => e.target.style.background = '#1D4ED8'}
        onMouseOut={(e) => e.target.style.background = '#2563EB'}
      >
        <Plus style={{ width: '20px', height: '20px' }} />
        Add New Task
      </button>

      <div style={styles.sidebarCard}>
        <h3 style={styles.sidebarTitle}>Categories</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {categories.map(category => {
            const IconComponent = category.icon;
            const isActive = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                style={{
                  ...styles.categoryButton,
                  ...(isActive ? styles.categoryActive : styles.categoryInactive)
                }}
              >
                <IconComponent style={{ width: '16px', height: '16px' }} />
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={styles.sidebarCard}>
        <h3 style={styles.sidebarTitle}>Quick Actions</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button style={{ ...styles.categoryButton, ...styles.categoryInactive }}>
            Clear Completed
          </button>
          <button style={{ ...styles.categoryButton, ...styles.categoryInactive }}>
            Export Tasks
          </button>
          <button style={{ ...styles.categoryButton, ...styles.categoryInactive }}>
            Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;