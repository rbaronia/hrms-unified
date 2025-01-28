const labels = {
  appTitle: 'HRMS',
  buttons: {
    save: 'Save',
    update: 'Update',
    delete: 'Delete',
    cancel: 'Cancel',
    search: 'Search',
    clear: 'Clear',
    export: 'Export',
    import: 'Import',
    addUser: 'Add User',
    edit: 'Edit',
    addDepartment: 'Add Department',
    addUserType: 'Add User Type'
  },
  user: {
    title: 'User Management',
    id: 'User ID',
    firstName: 'First Name',
    lastName: 'Last Name',
    streetAddr: 'Street Address',
    city: 'City',
    state: 'State',
    zipCode: 'ZIP Code',
    position: 'Position',
    manager: 'Manager',
    isManager: 'Is Manager',
    educationLevel: 'Education Level',
    educationLevelOptions: {
      hs: 'High School',
      be: 'Bachelor',
      ms: 'Master',
      phd: 'PhD'
    },
    status: 'Status',
    statusOptions: {
      active: 'Active',
      inactive: 'Inactive'
    },
    department: 'Department',
    userType: 'User Type',
    validations: {
      required: 'This field is required',
      invalid: 'Invalid value'
    }
  },
  department: {
    title: 'Department Management',
    id: 'Department ID',
    name: 'Department Name',
    parent: 'Parent Department',
    deptName: 'Department Name',
    parentId: 'Parent Department',
    add: 'Add Department',
    edit: 'Edit Department'
  },
  userType: {
    title: 'User Types Management',
    id: 'Type ID',
    name: 'Type Name',
    add: 'Add User Type',
    edit: 'Edit User Type',
    delete: 'Delete User Type',
    actions: 'Actions'
  },
  eduLevelOptions: {
    hs: 'High School',
    be: 'Bachelor',
    ms: 'Master',
    phd: 'PhD'
  },
  statusOptions: {
    active: 'Active',
    inactive: 'Inactive'
  },
  tableHeaders: {
    user: {
      id: 'ID',
      name: 'Name',
      department: 'Department',
      title: 'Position',
      status: 'Status',
      type: 'Type',
      lastModified: 'Last Modified',
      actions: 'Actions'
    }
  },
  messages: {
    confirmDelete: 'Are you sure you want to delete this item?',
    saveSuccess: 'Successfully saved!',
    updateSuccess: 'Successfully updated!',
    deleteSuccess: 'Successfully deleted!',
    error: 'An error occurred. Please try again.',
    unassigned: 'Unassigned'
  },
  dashboard: {
    title: 'Dashboard',
    departmentDistribution: 'Department Distribution',
    userTypeDistribution: 'User Type Distribution',
    recentHires: 'Recent Hires',
    recentUpdates: 'Recent Updates',
    reportees: 'Reportees',
    name: 'Name',
    department: 'Department',
    joinDate: 'Join Date',
    lastModified: 'Last Modified',
    totalUsers: 'Total Users',
    noUpdates: 'No recent updates',
    lastHour: 'Last Hour',
    last24Hours: 'Last 24 Hours'
  }
};

export default labels;
