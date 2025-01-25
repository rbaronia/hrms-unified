const express = require('express');
const router = express.Router();
const db = require('../utils/db/connection');
const logger = require('../utils/logger');

// Generate unique userId
async function generateUserId(firstName, lastName) {
    try {
        if (!firstName || !lastName) {
            throw new Error('First name and last name are required for user ID generation');
        }
        
        const baseUserId = (firstName.charAt(0) + lastName).toLowerCase();
        let userId = baseUserId;
        let counter = 1;
        
        while (true) {
            const [rows] = await db.query(
                'SELECT userid FROM EMPLOYEE WHERE LOWER(userid) = LOWER(?)',
                [userId]
            );
            
            if (rows.length === 0) {
                return userId;
            }
            
            userId = `${baseUserId}${counter}`;
            counter++;
            
            // Prevent infinite loop
            if (counter > 100) {
                throw new Error('Unable to generate unique user ID after 100 attempts');
            }
        }
    } catch (error) {
        logger.error('Error in generateUserId:', error);
        throw error;
    }
}

// Get department hierarchy
const getDepartmentHierarchy = async () => {
    const [departments] = await db.query('SELECT DEPTID, PARENTID, DEPTNAME FROM DEPARTMENT ORDER BY DEPTNAME');
    const deptMap = new Map(departments.map(d => [d.DEPTID, { ...d, level: 0, children: [] }]));
    
    // Build hierarchy with cycle detection
    const rootDepts = [];
    const processedDepts = new Set();
    
    departments.forEach(dept => {
        const deptNode = deptMap.get(dept.DEPTID);
        if (!processedDepts.has(dept.DEPTID)) {
            processedDepts.add(dept.DEPTID);
            
            if (dept.PARENTID === null) {
                rootDepts.push(deptNode);
            } else {
                const parent = deptMap.get(dept.PARENTID);
                if (parent && !processedDepts.has(dept.PARENTID)) {
                    parent.children.push(deptNode);
                    deptNode.level = parent.level + 1;
                } else {
                    // If parent is already processed or not found, add as root
                    rootDepts.push(deptNode);
                }
            }
        }
    });

    // Calculate indented names with non-breaking spaces
    const calculateIndentedNames = (depts) => {
        depts.sort((a, b) => a.DEPTNAME.localeCompare(b.DEPTNAME));
        depts.forEach(dept => {
            dept.indentedName = '\u00A0\u00A0\u00A0\u00A0'.repeat(dept.level) + dept.DEPTNAME;
            if (dept.children.length > 0) {
                calculateIndentedNames(dept.children);
            }
        });
    };

    calculateIndentedNames(rootDepts);
    return deptMap;
};

// Get all employees
router.get('/', async (req, res) => {
    try {
        const deptHierarchy = await getDepartmentHierarchy();

        const [rows] = await db.query(`
            SELECT 
                e.ID as id,
                e.USERID as userid,
                e.FIRSTNAME as firstname,
                e.LASTNAME as lastname,
                e.STREETADDR as streetaddr,
                e.CITY as city,
                e.STATE as state,
                e.ZIPCODE as zipcode,
                e.TITLE as title,
                e.MANAGER as manager,
                e.ISMANAGER as ismanager,
                e.EDULEVEL as edulevel,
                e.STATUS as status,
                e.DEPTID as deptid,
                e.TYPEID as typeid,
                e.DATE_MODIFIED as date_modified,
                d.DEPTNAME as deptname,
                ut.TYPENAME as typename,
                CONCAT(m.FIRSTNAME, ' ', m.LASTNAME, ' (', m.USERID, ')') as managername
            FROM EMPLOYEE e
            LEFT JOIN DEPARTMENT d ON e.DEPTID = d.DEPTID
            LEFT JOIN USERTYPE ut ON e.TYPEID = ut.TYPEID
            LEFT JOIN EMPLOYEE m ON e.MANAGER = m.USERID
            ORDER BY e.DATE_MODIFIED DESC
        `);

        // Add indented department names
        const enhancedRows = rows.map(row => ({
            ...row,
            deptname: row.deptid ? deptHierarchy.get(row.deptid)?.indentedName || row.deptname : row.deptname
        }));

        logger.info('Retrieved all employees with department hierarchy and user type info');
        res.json(enhancedRows);
    } catch (error) {
        logger.error('Error retrieving employees:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all managers
router.get('/managers', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                ID as id,
                FIRSTNAME as firstname,
                LASTNAME as lastname,
                USERID as userid
            FROM EMPLOYEE 
            WHERE ISMANAGER = 1
            ORDER BY FIRSTNAME, LASTNAME
        `);
        logger.info('Retrieved all managers');
        res.json(rows);
    } catch (error) {
        logger.error('Error retrieving managers:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get departments
router.get('/departments', async (req, res) => {
    try {
        const [departments] = await db.query(`
            SELECT 
                DEPTID as deptid,
                PARENTID as parentid,
                DEPTNAME as deptname
            FROM DEPARTMENT
            ORDER BY DEPTNAME
        `);
        
        res.json(departments);
    } catch (error) {
        logger.error('Error retrieving departments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all user types
router.get('/userTypes', async (req, res) => {
    try {
        logger.info('Attempting to fetch user types');
        const [rows] = await db.query(`
            SELECT 
                TYPEID as typeid,
                TYPENAME as typename
            FROM USERTYPE
            ORDER BY TYPENAME
        `);
        logger.info(`Retrieved ${rows.length} user types`);
        logger.debug('User types:', rows);
        res.json(rows);
    } catch (error) {
        logger.error('Error retrieving user types:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Get employee by ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                e.ID as id,
                e.USERID as userid,
                e.FIRSTNAME as firstname,
                e.LASTNAME as lastname,
                e.STREETADDR as streetaddr,
                e.CITY as city,
                e.STATE as state,
                e.ZIPCODE as zipcode,
                e.TITLE as title,
                e.MANAGER as manager,
                e.ISMANAGER as ismanager,
                e.EDULEVEL as edulevel,
                e.STATUS as status,
                e.DEPTID as deptid,
                e.TYPEID as typeid,
                e.DATE_MODIFIED as date_modified,
                d.DEPTNAME as deptname,
                ut.TYPENAME as typename,
                CONCAT(m.FIRSTNAME, ' ', m.LASTNAME, ' (', m.USERID, ')') as managername
            FROM EMPLOYEE e
            LEFT JOIN DEPARTMENT d ON e.DEPTID = d.DEPTID
            LEFT JOIN USERTYPE ut ON e.TYPEID = ut.TYPEID
            LEFT JOIN EMPLOYEE m ON e.MANAGER = m.USERID
            WHERE e.ID = ?
        `, [req.params.id]);
        
        if (rows.length === 0) {
            logger.warn(`Employee not found with ID: ${req.params.id}`);
            return res.status(404).json({ error: 'Employee not found' });
        }

        // Convert ismanager to boolean for frontend
        rows[0].ismanager = rows[0].ismanager === '1';
        
        logger.info(`Retrieved employee with ID: ${req.params.id}`);
        res.json(rows[0]);
    } catch (error) {
        logger.error(`Error retrieving employee ${req.params.id}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new employee
router.post('/', async (req, res) => {
    try {
        const {
            firstname, lastname, streetaddr, city, state, zipcode,
            title, manager, ismanager, edulevel, status, deptid, typeid
        } = req.body;

        logger.info('Creating employee with data:', req.body);

        if (!firstname || !lastname) {
            return res.status(400).json({ 
                error: 'First name and last name are required',
                details: 'These fields are necessary for user ID generation'
            });
        }

        // Validate required fields
        if (!deptid) {
            return res.status(400).json({
                error: 'Department is required',
                details: 'Please select a department'
            });
        }

        if (!typeid) {
            return res.status(400).json({
                error: 'User Type is required',
                details: 'Please select a user type'
            });
        }

        const userId = await generateUserId(firstname, lastname);
        
        // Convert empty strings to null for optional fields
        const processedData = {
            userId,
            firstname,
            lastname,
            streetaddr: streetaddr || null,
            city: city || null,
            state: state || null,
            zipcode: zipcode || null,
            title: title || null,
            manager: manager || null,
            ismanager: ismanager === '1' ? '1' : '0',
            edulevel: edulevel || null,
            status: status || '0', // Default to Active (0)
            deptid: deptid ? parseInt(deptid) : null,
            typeid: typeid ? parseInt(typeid) : null
        };

        const [result] = await db.query(
            `INSERT INTO EMPLOYEE (
                USERID, FIRSTNAME, LASTNAME, STREETADDR, CITY, STATE, ZIPCODE,
                TITLE, MANAGER, ISMANAGER, EDULEVEL, STATUS, DEPTID, TYPEID
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                processedData.userId,
                processedData.firstname,
                processedData.lastname,
                processedData.streetaddr,
                processedData.city,
                processedData.state,
                processedData.zipcode,
                processedData.title,
                processedData.manager,
                processedData.ismanager,
                processedData.edulevel,
                processedData.status,
                processedData.deptid,
                processedData.typeid
            ]
        );
        
        logger.info('Created new employee:', { userId });
        const [newEmployee] = await db.query('SELECT * FROM EMPLOYEE WHERE ID = ?', [result.insertId]);
        res.status(201).json(newEmployee[0]);
    } catch (error) {
        logger.error('Error creating employee:', error);
        res.status(500).json({ 
            error: 'Error creating employee', 
            details: error.message 
        });
    }
});

// Update employee
router.put('/:id', async (req, res) => {
    try {
        const {
            firstname, lastname, streetaddr, city, state, zipcode,
            title, manager, ismanager, edulevel, status, deptid, typeid
        } = req.body;

        const processedData = {
            firstname,
            lastname,
            streetaddr: streetaddr || null,
            city: city || null,
            state: state || null,
            zipcode: zipcode || null,
            title: title || null,
            manager: manager || null,
            ismanager: ismanager === '1' ? '1' : '0',
            edulevel: edulevel || null,
            status: status || '0',
            deptid: deptid ? parseInt(deptid) : null,
            typeid: typeid ? parseInt(typeid) : null
        };

        const [result] = await db.query(
            `UPDATE EMPLOYEE SET 
                FIRSTNAME = ?, LASTNAME = ?, STREETADDR = ?, CITY = ?, 
                STATE = ?, ZIPCODE = ?, TITLE = ?, MANAGER = ?, 
                ISMANAGER = ?, EDULEVEL = ?, STATUS = ?, DEPTID = ?, 
                TYPEID = ?
            WHERE ID = ?`,
            [
                processedData.firstname,
                processedData.lastname,
                processedData.streetaddr,
                processedData.city,
                processedData.state,
                processedData.zipcode,
                processedData.title,
                processedData.manager,
                processedData.ismanager,
                processedData.edulevel,
                processedData.status,
                processedData.deptid,
                processedData.typeid,
                req.params.id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        const [updatedEmployee] = await db.query('SELECT * FROM EMPLOYEE WHERE ID = ?', [req.params.id]);
        res.json(updatedEmployee[0]);
    } catch (error) {
        logger.error('Error updating employee:', error);
        res.status(500).json({ 
            error: 'Error updating employee', 
            details: error.message 
        });
    }
});

// Delete employee
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if employee exists
        const [checkRows] = await db.query('SELECT ID FROM EMPLOYEE WHERE ID = ?', [id]);
        if (checkRows.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        // Check if employee is a manager
        const [managerRows] = await db.query('SELECT ID FROM EMPLOYEE WHERE MANAGER = ?', [id]);
        if (managerRows.length > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete this employee as they are a manager for other employees. Please reassign their subordinates first.'
            });
        }

        // Delete employee
        await db.query('DELETE FROM EMPLOYEE WHERE ID = ?', [id]);
        
        logger.info(`Employee with ID ${id} deleted successfully`);
        res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
        logger.error('Error deleting employee:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Check if userId exists and get next available
router.get('/checkUserId/:baseId', async (req, res) => {
    try {
        const baseId = req.params.baseId.toLowerCase();
        let counter = 0;
        let suggestedId = baseId;
        let exists = true;

        while (exists && counter < 100) {
            const [rows] = await db.query(
                'SELECT COUNT(*) as count FROM EMPLOYEE WHERE LOWER(userid) = ?',
                [suggestedId]
            );
            
            exists = rows[0].count > 0;
            
            if (exists) {
                counter++;
                suggestedId = `${baseId}${counter}`;
            }
        }

        res.json({
            exists: exists,
            suggestedId: suggestedId
        });
    } catch (error) {
        logger.error('Error checking userId:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

module.exports = router;
