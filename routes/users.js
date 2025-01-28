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
                'SELECT userid FROM USER WHERE LOWER(userid) = LOWER(?)',
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
    try {
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
    } catch (error) {
        logger.error('Error in getDepartmentHierarchy:', error);
        throw error;
    }
};

// Get all users
router.get('/', async (req, res) => {
    try {
        logger.info('Fetching all users with department hierarchy');
        const deptHierarchy = await getDepartmentHierarchy();

        const [rows] = await db.query(`
            SELECT 
                u.ID as id,
                u.USERID as userid,
                u.FIRSTNAME as firstname,
                u.LASTNAME as lastname,
                u.STREETADDR as streetaddr,
                u.CITY as city,
                u.STATE as state,
                u.ZIPCODE as zipcode,
                u.TITLE as title,
                u.MANAGER as manager,
                u.ISMANAGER as ismanager,
                u.EDULEVEL as edulevel,
                u.STATUS as status,
                u.DEPTID as deptid,
                u.TYPEID as typeid,
                u.DATE_MODIFIED as date_modified,
                d.DEPTNAME as deptname,
                ut.TYPENAME as typename,
                CONCAT(m.FIRSTNAME, ' ', m.LASTNAME, ' (', m.USERID, ')') as managername
            FROM USER u
            LEFT JOIN DEPARTMENT d ON u.DEPTID = d.DEPTID
            LEFT JOIN USERTYPE ut ON u.TYPEID = ut.TYPEID
            LEFT JOIN USER m ON u.MANAGER = m.USERID
            ORDER BY u.DATE_MODIFIED DESC
        `);

        // Add indented department names
        const enhancedRows = rows.map(row => ({
            ...row,
            deptname: row.deptid ? deptHierarchy.get(row.deptid)?.indentedName || row.deptname : row.deptname
        }));

        logger.info(`Successfully retrieved ${enhancedRows.length} users`);
        res.json(enhancedRows);
    } catch (error) {
        logger.error('Error retrieving users:', error);
        res.status(500).json({ 
            error: 'Failed to load users',
            message: 'An error occurred while retrieving user data',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get all managers
router.get('/managers', async (req, res) => {
    try {
        logger.info('Fetching active managers');
        const [managers] = await db.query(`
            SELECT 
                ID as id,
                USERID as userid,
                FIRSTNAME as firstname,
                LASTNAME as lastname,
                CONCAT(FIRSTNAME, ' ', LASTNAME) as displayName
            FROM USER 
            WHERE ISMANAGER = '1' AND STATUS = '0'
            ORDER BY FIRSTNAME, LASTNAME
        `);

        logger.info(`Successfully retrieved ${managers.length} managers`);
        res.json(managers);
    } catch (error) {
        logger.error('Error retrieving managers:', error);
        res.status(500).json({ 
            error: 'Failed to load managers',
            message: 'An error occurred while retrieving manager data',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Generate user ID based on first name and last name
router.get('/generate-userid', async (req, res) => {
    try {
        const { firstName, lastName } = req.query;
        
        if (!firstName || !lastName) {
            return res.status(400).json({ 
                error: 'Missing required parameters',
                message: 'First name and last name are required'
            });
        }

        const userId = await generateUserId(firstName, lastName);
        logger.info(`Generated user ID: ${userId} for ${firstName} ${lastName}`);
        res.json({ userId });
    } catch (error) {
        logger.error('Error generating user ID:', error);
        res.status(500).json({ 
            error: 'Failed to generate user ID',
            message: error.message
        });
    }
});

// Get user by ID
router.get('/:id', async (req, res) => {
    try {
        logger.info(`Fetching user with ID: ${req.params.id}`);
        const [rows] = await db.query(`
            SELECT 
                u.ID as id,
                u.USERID as userid,
                u.FIRSTNAME as firstname,
                u.LASTNAME as lastname,
                u.STREETADDR as streetaddr,
                u.CITY as city,
                u.STATE as state,
                u.ZIPCODE as zipcode,
                u.TITLE as title,
                u.MANAGER as manager,
                u.ISMANAGER as ismanager,
                u.EDULEVEL as edulevel,
                u.STATUS as status,
                u.DEPTID as deptid,
                u.TYPEID as typeid,
                u.DATE_MODIFIED as date_modified,
                d.DEPTNAME as deptname,
                ut.TYPENAME as typename,
                m.ID as manager_id,
                m.USERID as manager_userid,
                CONCAT(m.FIRSTNAME, ' ', m.LASTNAME) as managername
            FROM USER u
            LEFT JOIN DEPARTMENT d ON u.DEPTID = d.DEPTID
            LEFT JOIN USERTYPE ut ON u.TYPEID = ut.TYPEID
            LEFT JOIN USER m ON u.MANAGER = m.ID
            WHERE u.ID = ?
        `, [req.params.id]);

        if (rows.length === 0) {
            logger.warn(`No user found with ID: ${req.params.id}`);
            return res.status(404).json({ error: 'User not found' });
        }

        logger.info(`Successfully retrieved user with ID: ${req.params.id}`);
        res.json(rows[0]);
    } catch (error) {
        logger.error(`Error retrieving user with ID ${req.params.id}:`, error);
        res.status(500).json({ 
            error: 'Failed to load user',
            message: 'An error occurred while retrieving user data',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get departments
router.get('/departments', async (req, res) => {
    try {
        logger.info('Fetching departments');
        const [departments] = await db.query(`
            SELECT 
                DEPTID,
                DEPTNAME,
                PARENTID
            FROM DEPARTMENT 
            ORDER BY DEPTNAME
        `);
        
        logger.info(`Successfully retrieved ${departments.length} departments`);
        res.json(departments);
    } catch (error) {
        logger.error('Error retrieving departments:', error);
        res.status(500).json({ 
            error: 'Failed to load departments',
            message: 'An error occurred while retrieving department data',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get user types
router.get('/user-types', async (req, res) => {
    try {
        logger.info('Fetching user types');
        const [userTypes] = await db.query(`
            SELECT 
                TYPEID,
                TYPENAME
            FROM USERTYPE 
            ORDER BY TYPENAME
        `);
        
        logger.info(`Successfully retrieved ${userTypes.length} user types`);
        res.json(userTypes);
    } catch (error) {
        logger.error('Error retrieving user types:', error);
        res.status(500).json({ 
            error: 'Failed to load user types',
            message: 'An error occurred while retrieving user type data',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Create new user
router.post('/', async (req, res) => {
    try {
        const {
            firstname, lastname, streetaddr, city, state, zipcode,
            title, manager, ismanager, edulevel, status, deptid, typeid, userid
        } = req.body;

        // Validate required fields
        if (!firstname || !lastname || !deptid || !typeid || !userid) {
            return res.status(400).json({
                error: 'Missing required fields',
                message: 'First name, last name, department, user type, and user ID are required'
            });
        }

        // Convert empty strings to null and ensure proper data types
        const processedData = {
            USERID: userid,
            FIRSTNAME: firstname,
            LASTNAME: lastname,
            STREETADDR: streetaddr || null,
            CITY: city || null,
            STATE: state || null,
            ZIPCODE: zipcode || null,
            TITLE: title || null,
            MANAGER: manager || null,
            ISMANAGER: ismanager ? '1' : '0',
            EDULEVEL: edulevel || 'HS',
            STATUS: status ? '1' : '0',
            DEPTID: deptid ? parseInt(deptid) : null,
            TYPEID: typeid ? parseInt(typeid) : null
        };

        // Check if user ID already exists
        const [existingUser] = await db.query(
            'SELECT USERID FROM USER WHERE USERID = ?',
            [processedData.USERID]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({
                error: 'User ID already exists',
                message: 'Please use a different user ID'
            });
        }

        // Insert new user with processed data
        const [result] = await db.query(
            `INSERT INTO USER (
                USERID, FIRSTNAME, LASTNAME, STREETADDR, CITY, STATE, ZIPCODE,
                TITLE, MANAGER, ISMANAGER, EDULEVEL, STATUS, DEPTID, TYPEID
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                processedData.USERID,
                processedData.FIRSTNAME,
                processedData.LASTNAME,
                processedData.STREETADDR,
                processedData.CITY,
                processedData.STATE,
                processedData.ZIPCODE,
                processedData.TITLE,
                processedData.MANAGER,
                processedData.ISMANAGER,
                processedData.EDULEVEL,
                processedData.STATUS,
                processedData.DEPTID,
                processedData.TYPEID
            ]
        );

        logger.info(`Created new user with ID: ${result.insertId}`);
        res.status(201).json({
            message: 'User created successfully',
            id: result.insertId
        });
    } catch (error) {
        logger.error('Error creating user:', error);
        res.status(500).json({
            error: 'Failed to create user',
            message: error.message
        });
    }
});

// Update user
router.put('/:id', async (req, res) => {
    try {
        const {
            firstname, lastname, streetaddr, city, state, zipcode,
            title, manager, ismanager, edulevel, status, deptid, typeid
        } = req.body;

        // Validate required fields
        if (!firstname || !lastname || !deptid || !typeid) {
            return res.status(400).json({
                error: 'Missing required fields',
                message: 'First name, last name, department, and user type are required'
            });
        }

        // Update user
        const [result] = await db.query(
            `UPDATE USER SET
                FIRSTNAME = ?, LASTNAME = ?, STREETADDR = ?, CITY = ?, STATE = ?, ZIPCODE = ?,
                TITLE = ?, MANAGER = ?, ISMANAGER = ?, EDULEVEL = ?, STATUS = ?, DEPTID = ?, TYPEID = ?
            WHERE ID = ?`,
            [
                firstname, lastname, streetaddr, city, state, zipcode,
                title, manager, ismanager, edulevel, status, deptid, typeid,
                req.params.id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'User not found',
                message: `No user found with ID ${req.params.id}`
            });
        }

        logger.info(`Updated user with ID: ${req.params.id}`);
        res.json({
            message: 'User updated successfully',
            id: req.params.id
        });
    } catch (error) {
        logger.error(`Error updating user with ID ${req.params.id}:`, error);
        res.status(500).json({
            error: 'Failed to update user',
            message: error.message
        });
    }
});

// Delete user
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user exists
        const [checkRows] = await db.query('SELECT ID FROM USER WHERE ID = ?', [id]);
        if (checkRows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if user is a manager
        const [managerRows] = await db.query('SELECT ID FROM USER WHERE MANAGER = ?', [id]);
        if (managerRows.length > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete this user as they are a manager for other users. Please reassign their subordinates first.'
            });
        }

        // Delete user
        await db.query('DELETE FROM USER WHERE ID = ?', [id]);
        
        logger.info(`User with ID ${id} deleted successfully`);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        logger.error('Error deleting user:', error);
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
                'SELECT COUNT(*) as count FROM USER WHERE LOWER(userid) = ?',
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
