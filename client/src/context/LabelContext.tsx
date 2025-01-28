import React, { createContext, useContext, useState, useEffect } from 'react';
import defaultLabels from '../utils/labels';

interface Labels {
  appTitle: string;
  buttons: {
    save: string;
    update: string;
    delete: string;
    cancel: string;
    search: string;
    clear: string;
    export: string;
    import: string;
    addUser: string;
    edit: string;
    addDepartment: string;
    addUserType: string;
  };
  user: {
    title: string;
    id: string;
    firstName: string;
    lastName: string;
    streetAddr: string;
    city: string;
    state: string;
    zipCode: string;
    position: string;
    manager: string;
    isManager: string;
    educationLevel: string;
    educationLevelOptions: {
      hs: string;
      be: string;
      ms: string;
      phd: string;
    };
    status: string;
    statusOptions: {
      active: string;
      inactive: string;
    };
    department: string;
    userType: string;
    validations: {
      required: string;
      invalid: string;
    };
  };
  department: {
    title: string;
    id: string;
    name: string;
    parent: string;
    deptName: string;
    parentId: string;
    add: string;
    edit: string;
  };
  userType: {
    title: string;
    id: string;
    name: string;
    add: string;
    edit: string;
    delete: string;
    actions: string;
  };
  tableHeaders: {
    user: {
      id: string;
      name: string;
      department: string;
      title: string;
      status: string;
      type: string;
      lastModified: string;
      actions: string;
    };
  };
  messages: {
    confirmDelete: string;
    saveSuccess: string;
    updateSuccess: string;
    deleteSuccess: string;
    error: string;
    unassigned: string;
  };
}

interface LabelContextType {
  labels: Labels;
  updateLabels: (newLabels: Labels) => void;
}

const LabelContext = createContext<LabelContextType>({
  labels: defaultLabels as Labels,
  updateLabels: () => {}
});

export const useLabelContext = () => useContext(LabelContext);

export const LabelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [labels, setLabels] = useState<Labels>(defaultLabels as Labels);

  useEffect(() => {
    const savedLabels = localStorage.getItem('customLabels');
    if (savedLabels) {
      try {
        const parsedLabels = JSON.parse(savedLabels);
        setLabels(parsedLabels);
      } catch (error) {
        console.error('Error parsing saved labels:', error);
      }
    }
  }, []);

  const updateLabels = (newLabels: Labels) => {
    setLabels(newLabels);
    localStorage.setItem('customLabels', JSON.stringify(newLabels));
  };

  return (
    <LabelContext.Provider value={{ labels, updateLabels }}>
      {children}
    </LabelContext.Provider>
  );
};

export default LabelContext;
