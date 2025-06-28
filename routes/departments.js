const express = require('express');
const router = express.Router();
const db = require('../utils/db/connection');
const logger = require('../utils/logger');

// Get all departments
router.get('/', async (req, res) => {
    try {
        logger.info('Fetching departments');
        const [departments] = await db.query(`
            SELECT 
                d.DEPTID as deptid,
                d.DEPTNAME as deptname,
                d.PARENTID as parentid,
                COUNT(u.ID) as userCount
            FROM DEPARTMENT d
            LEFT JOIN USER u ON u.DEPTID = d.DEPTID
            GROUP BY d.DEPTID, d.DEPTNAME, d.PARENTID
            ORDER BY d.DEPTNAME
        `);
        
        logger.info('Departments query result:', { departments });
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

// Get department by ID
router.get('/:id', async (req, res) => {
    try {
        logger.info(`Fetching department with ID: ${req.params.id}`);
        const [department] = await db.query(`
            SELECT 
                DEPTID as deptid,
                DEPTNAME as deptname,
                PARENTID as parentid
            FROM DEPARTMENT 
            WHERE DEPTID = ?
        `, [req.params.id]);

        if (department.length === 0) {
            logger.warn(`Department not found with ID: ${req.params.id}`);
            return res.status(404).json({ error: 'Department not found' });
        }

        logger.info(`Successfully retrieved department with ID: ${req.params.id}`);
        res.json(department[0]);
    } catch (error) {
        logger.error(`Error retrieving department with ID ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to load department' });
    }
});

// Get department hierarchy
router.get('/hierarchy', async (req, res) => {
    try {
        // First get all departments
        const [allDepts] = await db.query('SELECT * FROM DEPARTMENT ORDER BY DEPTID');
        
        // Then build the hierarchy
        const buildHierarchy = (parentId = null) => {
            return allDepts
                .filter(dept => dept.PARENTID === parentId)
                .map(dept => ({
                    deptid: dept.DEPTID,
                    deptname: dept.DEPTNAME,
                    parentid: dept.PARENTID,
                    children: buildHierarchy(dept.DEPTID)
                }));
        };
        
        const hierarchicalDepts = buildHierarchy();
        logger.info(`Retrieved department hierarchy with ${allDepts.length} departments`);
        res.json(hierarchicalDepts);
    } catch (error) {
        logger.error('Error retrieving department hierarchy:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new department
router.post('/', async (req, res) => {
    try {
        const { deptname, parentid } = req.body;

        if (!deptname) {
            return res.status(400).json({ error: 'Department name is required' });
        }

        // If parentid is empty string or undefined, set to null
        const parentIdValue = parentid === '' || parentid === undefined ? null : parentid;
        try {
            const [result] = await db.query(
                'INSERT INTO DEPARTMENT (DEPTNAME, PARENTID) VALUES (?, ?)',
                [deptname, parentIdValue]
            );
            logger.info(`Created new department with ID: ${result.insertId}`);
            res.status(201).json({
                deptid: result.insertId,
                deptname,
                parentid: parentIdValue
            });
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                logger.error('Duplicate department name');
                return res.status(409).json({ error: 'Department name already exists' });
            } else if (err.code === 'ER_NO_DEFAULT_FOR_FIELD') {
                logger.error('Department creation failed: missing required field(s)');
                return res.status(400).json({ error: 'Missing required field(s) for department' });
            }
            logger.error('Error creating department:', err);
            res.status(500).json({ error: 'Internal server error', details: err.message });
        }
    } catch (error) {
        logger.error('Error creating department:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update department
router.put('/:id', async (req, res) => {
    try {
        const { deptname, parentid } = req.body;
        
        if (!deptname) {
            return res.status(400).json({ error: 'Department name is required' });
        }
        
        // Check for circular reference
        if (parentid) {
            const [parentCheck] = await db.query(
                'SELECT PARENTID FROM DEPARTMENT WHERE DEPTID = ?',
                [parentid]
            );
            
            if (parentCheck.length > 0 && parentCheck[0].PARENTID === req.params.id) {
                return res.status(400).json({ error: 'Circular reference detected' });
            }
        }
        
        const [result] = await db.query(
            'UPDATE DEPARTMENT SET DEPTNAME = ?, PARENTID = ? WHERE DEPTID = ?',
            [deptname, parentid, req.params.id]
        );
        
        if (result.affectedRows === 0) {
            logger.warn(`Department not found with ID: ${req.params.id}`);
            return res.status(404).json({ error: 'Department not found' });
        }
        
        logger.info(`Updated department with ID: ${req.params.id}`);
        res.json({ 
            deptid: parseInt(req.params.id),
            deptname,
            parentid
        });
    } catch (error) {
        logger.error(`Error updating department with ID ${req.params.id}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete department
router.delete('/:id', async (req, res) => {
    try {
        // First check if there are any child departments
        const [childDepts] = await db.query(
            'SELECT DEPTID FROM DEPARTMENT WHERE PARENTID = ?',
            [req.params.id]
        );
        
        if (childDepts.length > 0) {
            logger.warn(`Cannot delete department with ID ${req.params.id} because it has child departments`);
            return res.status(400).json({ 
                error: 'Cannot delete department with child departments' 
            });
        }
        
        // Then check if there are any users in this department
        const [users] = await db.query(
            'SELECT ID FROM USER WHERE DEPTID = ?',
            [req.params.id]
        );
        
        if (users.length > 0) {
            logger.warn(`Cannot delete department with ID ${req.params.id} because it has assigned users`);
            return res.status(400).json({ 
                error: 'Cannot delete department with assigned users' 
            });
        }
        
        const [result] = await db.query(
            'DELETE FROM DEPARTMENT WHERE DEPTID = ?',
            [req.params.id]
        );
        
        if (result.affectedRows === 0) {
            logger.warn(`Department not found with ID: ${req.params.id}`);
            return res.status(404).json({ error: 'Department not found' });
        }
        
        logger.info(`Deleted department with ID: ${req.params.id}`);
        res.status(204).send();
    } catch (error) {
        logger.error(`Error deleting department with ID ${req.params.id}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
