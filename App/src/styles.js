export const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ffffffff 0%, #e7dca0 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    main: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '24px'
    },
    header: {
      marginBottom: '32px'
    },
    headerTop: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '24px'
    },
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#111827',
      margin: '0 0 8px 0'
    },
    subtitle: {
      color: '#6B7280',
      margin: 0
    },
    searchContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    searchInput: {
      position: 'relative'
    },
    searchField: {
      paddingLeft: '40px',
      paddingRight: '16px',
      paddingTop: '8px',
      paddingBottom: '8px',
      background: 'white',
      border: '1px solid #E5E7EB',
      borderRadius: '12px',
      outline: 'none',
      width: '256px',
      transition: 'all 0.2s'
    },
    searchIcon: {
      position: 'absolute',
      left: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#9CA3AF',
      width: '16px',
      height: '16px'
    },
    filterButton: {
      padding: '8px',
      borderRadius: '12px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    filterButtonActive: {
      background: '#DBEAFE',
      color: '#2563EB'
    },
    filterButtonInactive: {
      background: 'white',
      color: '#6B7280'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '16px',
      marginBottom: '24px'
    },
    statCard: {
      background: 'white',
      padding: '16px',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #F3F4F6'
    },
    statNumber: {
      fontSize: '24px',
      fontWeight: 'bold',
      margin: 0
    },
    statLabel: {
      fontSize: '14px',
      color: '#6B7280',
      margin: 0
    },
    filtersPanel: {
      background: 'white',
      padding: '16px',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #F3F4F6',
      marginBottom: '24px'
    },
    layout: {
      display: 'flex',
      gap: '24px'
    },
    sidebar: {
      width: '320px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    },
    addButton: {
      width: '100%',
      background: '#2563EB',
      color: 'white',
      padding: '12px 16px',
      borderRadius: '12px',
      border: 'none',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'all 0.2s'
    },
    sidebarCard: {
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #F3F4F6',
      padding: '16px'
    },
    sidebarTitle: {
      fontWeight: '600',
      color: '#111827',
      marginBottom: '12px',
      margin: 0
    },
    categoryButton: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '8px 12px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontWeight: '500',
      textAlign: 'left'
    },
    categoryActive: {
      background: '#EFF6FF',
      color: '#2563EB',
      border: '1px solid #BFDBFE'
    },
    categoryInactive: {
      color: '#374151',
      background: 'transparent',
      border: '1px solid transparent'
    },
    mainContent: {
      flex: 1
    },
    addForm: {
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #F3F4F6',
      padding: '24px',
      marginBottom: '24px'
    },
    formTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '16px',
      margin: 0
    },
    input: {
      width: '100%',
      padding: '8px 16px',
      background: '#F9FAFB',
      border: '1px solid #E5E7EB',
      borderRadius: '8px',
      marginBottom: '16px',
      outline: 'none',
      boxSizing: 'border-box'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      marginBottom: '16px'
    },
    label: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '8px',
      display: 'block'
    },
    priorityButtons: {
      display: 'flex',
      gap: '8px'
    },
    priorityButton: {
      flex: 1,
      padding: '4px 8px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    tagContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px'
    },
    tagButton: {
      padding: '4px 12px',
      fontSize: '14px',
      fontWeight: '500',
      borderRadius: '20px',
      border: '1px solid',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    tagActive: {
      background: '#DBEAFE',
      color: '#1D4ED8',
      borderColor: '#BFDBFE'
    },
    tagInactive: {
      background: '#F9FAFB',
      color: '#374151',
      borderColor: '#E5E7EB'
    },
    formButtons: {
      display: 'flex',
      gap: '12px',
      paddingTop: '8px'
    },
    submitButton: {
      padding: '8px 24px',
      background: '#2563EB',
      color: 'white',
      borderRadius: '8px',
      border: 'none',
      fontWeight: '500',
      cursor: 'pointer'
    },
    cancelButton: {
      padding: '8px 24px',
      background: '#F3F4F6',
      color: '#374151',
      borderRadius: '8px',
      border: 'none',
      fontWeight: '500',
      cursor: 'pointer'
    },
    tasksContainer: {
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #F3F4F6'
    },
    emptyState: {
      padding: '48px',
      textAlign: 'center'
    },
    emptyStateIcon: {
      color: '#9CA3AF',
      marginBottom: '16px',
      width: '48px',
      height: '48px',
      margin: '0 auto 16px auto'
    },
    emptyStateTitle: {
      fontSize: '18px',
      fontWeight: '500',
      color: '#111827',
      marginBottom: '8px',
      margin: 0
    },
    emptyStateText: {
      color: '#6B7280',
      margin: 0
    },
    taskItem: {
      padding: '16px',
      borderBottom: '1px solid #F3F4F6',
      transition: 'all 0.2s',
      cursor: 'move'
    },
    taskContent: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    checkbox: {
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      border: '2px solid',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s',
      flexShrink: 0
    },
    checkboxCompleted: {
      background: '#10B981',
      borderColor: '#10B981',
      color: 'white'
    },
    checkboxIncomplete: {
      borderColor: '#D1D5DB',
      background: 'transparent'
    },
    taskInfo: {
      flex: 1,
      minWidth: 0
    },
    taskText: {
      fontWeight: '500',
      marginBottom: '4px',
      margin: 0
    },
    taskTextCompleted: {
      textDecoration: 'line-through',
      color: '#6B7280'
    },
    taskTextNormal: {
      color: '#111827'
    },
    taskMeta: {
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '12px',
      fontSize: '14px',
      color: '#6B7280'
    },
    taskActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    actionButton: {
      padding: '4px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      background: 'transparent',
      color: '#9CA3AF',
      transition: 'all 0.2s'
    },
    editInput: {
      flex: 1,
      padding: '4px 8px',
      border: '1px solid #D1D5DB',
      borderRadius: '4px',
      outline: 'none'
    },
    editActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    tag: {
      padding: '2px 8px',
      background: '#F3F4F6',
      color: '#6B7280',
      borderRadius: '4px',
      fontSize: '12px'
    },
    priorityDot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      flexShrink: 0
    }
  };