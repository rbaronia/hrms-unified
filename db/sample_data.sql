-- Insert departments
INSERT INTO department (name, description, parentid) VALUES
('Engineering', 'Software Development Department', 1),
('HR', 'Human Resources Department', 1),
('Finance', 'Finance and Accounting Department', 1),
('Marketing', 'Marketing and Sales Department', 1);

-- Insert employees
INSERT INTO employee (userid, first_name, last_name, email, phone, department_id, user_type_id) VALUES
('jsmith', 'John', 'Smith', 'john.smith@company.com', '123-456-7890', 2, 1),
('mwhite', 'Mary', 'White', 'mary.white@company.com', '123-456-7891', 2, 2),
('rjohnson', 'Robert', 'Johnson', 'robert.johnson@company.com', '123-456-7892', 3, 3),
('ljones', 'Linda', 'Jones', 'linda.jones@company.com', '123-456-7893', 3, 3),
('mwilson', 'Michael', 'Wilson', 'michael.wilson@company.com', '123-456-7894', 4, 2),
('sbrown', 'Sarah', 'Brown', 'sarah.brown@company.com', '123-456-7895', 4, 3),
('dlee', 'David', 'Lee', 'david.lee@company.com', '123-456-7896', 5, 2),
('agarcia', 'Ana', 'Garcia', 'ana.garcia@company.com', '123-456-7897', 5, 3),
('wchen', 'William', 'Chen', 'william.chen@company.com', '123-456-7898', 2, 3),
('kpatel', 'Kiran', 'Patel', 'kiran.patel@company.com', '123-456-7899', 3, 3);
