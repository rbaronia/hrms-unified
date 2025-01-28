// Education level options that match the database
export type EduLevel = 'HS' | 'BE' | 'MS' | 'PHD';

// Status options that match the database char(1)
export type Status = '0' | '1' | '2';  // 0: Active, 1: Disabled, 2: Terminated

// IsManager options that match the database char(1)
export type IsManager = '0' | '1';

// Option type for select menus
export interface Option {
  value: string;
  label: string;
}

export interface User {
  id: number;
  userid: string;
  firstname: string;
  lastname: string;
  streetaddr: string | null;
  city: string | null;
  state: string | null;
  zipcode: string | null;
  title: string | null;
  manager: string | null;
  ismanager: string;
  edulevel: string;
  status: string;
  deptid: number | null;
  typeid: number | null;
  deptname?: string;
  typename?: string;
  date_modified: string;
  managername?: string;
  // Virtual fields for DataGrid
  name?: string;
  department?: string;
  type?: string;
  lastModified?: string;
  actions?: string;
}

export interface FormData {
  firstname: string;
  lastname: string;
  streetaddr: string;
  city: string;
  state: string;
  zipcode: string;
  deptid: string;
  typeid: string;
  title: string;
  manager: string;
  edulevel: string;
  ismanager: string;
  status: string;
}

export interface Manager {
  id: number;
  firstname: string;
  lastname: string;
  displayName?: string;
  userid: string;
}

export interface Department {
  deptid: number;
  deptname: string;
  parentid: number | null;
  level?: number;
  indentedName?: string;
}

export interface UserType {
  typeid: number;
  typename: string;
}
