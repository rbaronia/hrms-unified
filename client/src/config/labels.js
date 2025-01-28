module.exports = {
    // User form field labels
    user: {
        // Basic Information
        id: 'User ID',
        firstName: 'First Name',
        lastName: 'Last Name',
        
        // Contact Information
        streetAddr: 'Street Address',
        city: 'City',
        state: 'State',
        zipCode: 'ZIP Code',
        
        // Job Information
        title: 'Position',
        manager: 'Manager',
        isManager: 'Is Manager?',
        eduLevel: 'Education Level',
        status: 'Status',
        deptId: 'Department ID',
        typeId: 'Type ID',
        userId: 'User ID',
        dateModified: 'Last Modified',

        // Field validations
        validations: {
            required: '* Required field',
            firstName: 'First name must be between 2 and 250 characters',
            lastName: 'Last name must be between 2 and 250 characters',
            streetAddr: 'Street address must be less than 50 characters',
            city: 'City must be less than 50 characters',
            state: 'State must be 2 characters',
            zipCode: 'Please enter a valid ZIP code',
            userId: 'User ID must be less than 50 characters'
        }
    },

    // Department form field labels
    department: {
        title: 'Departments',
        deptId: 'Department ID',
        deptName: 'Department Name',
        parentId: 'Parent Department',
        add: 'Add Department',
        edit: 'Edit Department',
        
        // Field validations
        validations: {
            required: '* Required field',
            deptName: 'Department name must be less than 36 characters'
        }
    },

    // User Type form field labels
    userType: {
        title: 'User Types',
        typeId: 'Type ID',
        typeName: 'Type Name',
        add: 'Add User Type',
        edit: 'Edit User Type',
        
        // Field validations
        validations: {
            required: '* Required field',
            typeName: 'Type name must be less than 36 characters'
        }
    },

    // Status options
    statusOptions: {
        active: { value: '1', label: 'Active' },
        inactive: { value: '0', label: 'Inactive' }
    },

    // Manager options
    managerOptions: {
        yes: { value: '1', label: 'Yes' },
        no: { value: '0', label: 'No' }
    },

    // Education Level options
    eduLevelOptions: [
        { value: 'HS', label: 'High School' },
        { value: 'BE', label: 'Bachelor' },
        { value: 'MS', label: 'Master' },
        { value: 'PHD', label: 'Doctorate' }
    ],

    // Button labels
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
        addUserType: 'Add User Type',
        addDepartment: 'Add Department',
        edit: 'Edit',
        delete: 'Delete'
    },

    // Dashboard labels
    dashboard: {
        title: 'HRMS Dashboard',
        totalUsers: 'Total Users',
        departmentDistribution: 'Department Distribution',
        recentHires: 'Recent Hires',
        userTypeDistribution: 'User Type Distribution',
        activeInactive: 'Active vs Inactive Users',
        managerialRatio: 'Managerial Ratio',
        recentUpdates: {
            lastHour: 'Updates in Last Hour',
            last24Hours: 'Updates in Last 24 Hours',
            noUpdates: 'No recent updates'
        }
    },

    // Table column headers
    tableHeaders: {
        user: {
            id: 'ID',
            name: 'Name',
            department: 'Department',
            title: 'Title',
            status: 'Status',
            type: 'Type',
            lastModified: 'Last Modified'
        }
    },

    // Form section headers
    formSections: {
        basicInfo: 'Basic Information',
        contactInfo: 'Contact Information',
        jobInfo: 'Job Information',
        systemInfo: 'System Information'
    },

    // Messages
    messages: {
        saveSuccess: 'Successfully saved',
        saveFailed: 'Failed to save',
        updateSuccess: 'Successfully updated',
        updateFailed: 'Failed to update',
        deleteSuccess: 'Successfully deleted',
        deleteFailed: 'Failed to delete',
        confirmDelete: 'Are you sure you want to delete?',
        noResults: 'No results found',
        loading: 'Loading...',
        required: 'Please fill in all required fields',
        unassigned: 'Unassigned'
    }
}
