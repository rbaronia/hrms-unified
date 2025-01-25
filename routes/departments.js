const express = require('express');
const router = express.Router();
const db = require('../utils/db/connection');
const logger = require('../utils/logger');

// Get all departments
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM DEPARTMENT ORDER BY DEPTID');
        logger.info('Retrieved all departments');
        res.json(rows);
    } catch (error) {
        logger.error('Error retrieving departments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get department hierarchy
router.get('/hierarchy', async (req, res) => {
    try {
        const query = `
            WITH RECURSIVE dept_tree AS (
                SELECT DEPTID, DEPTNAME, PARENTID, 1 as level
                FROM DEPARTMENT
                WHERE PARENTID IS NULL
                
                UNION ALL
                
                SELECT d.DEPTID, d.DEPTNAME, d.PARENTID, dt.level + 1
                FROM DEPARTMENT d
                JOIN dept_tree dt ON d.PARENTID = dt.DEPTID
            )
            SELECT * FROM dept_tree ORDER BY level, DEPTID;
        `;
        
        const [rows] = await db.query(query);
        logger.info('Retrieved department hierarchy');
        res.json(rows);
    } catch (error) {
        logger.error('Error retrieving department hierarchy:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get department by ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM DEPARTMENT WHERE DEPTID = ?', [req.params.id]);
        if (rows.length === 0) {
            logger.warn(`Department not found with ID: ${req.params.id}`);
            return res.status(404).json({ error: 'Department not found' });
        }
        logger.info(`Retrieved department with ID: ${req.params.id}`);
        res.json(rows[0]);
    } catch (error) {
        logger.error(`Error retrieving department ${req.params.id}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new department
router.post('/', async (req, res) => {
    const { deptname, parentid } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO DEPARTMENT (DEPTNAME, PARENTID) VALUES (?, ?)',
            [deptname, parentid]
        );
        const [newDept] = await db.query('SELECT * FROM DEPARTMENT WHERE DEPTID = ?', [result.insertId]);
        logger.info('Created new department:', newDept[0]);
        res.status(201).json(newDept[0]);
    } catch (error) {
        logger.error('Error creating department:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update department
router.put('/:id', async (req, res) => {
    const { deptname, parentid } = req.body;
    try {
        const [result] = await db.query(
            'UPDATE DEPARTMENT SET DEPTNAME = ?, PARENTID = ? WHERE DEPTID = ?',
            [deptname, parentid, req.params.id]
        );
        
        if (result.affectedRows === 0) {
            logger.warn(`Department not found with ID: ${req.params.id}`);
            return res.status(404).json({ error: 'Department not found' });
        }

        const [updatedDept] = await db.query('SELECT * FROM DEPARTMENT WHERE DEPTID = ?', [req.params.id]);
        logger.info(`Updated department with ID: ${req.params.id}`);
        res.json(updatedDept[0]);
    } catch (error) {
        logger.error(`Error updating department ${req.params.id}:`, error);
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
            logger.warn(`Cannot delete department ${req.params.id}: has child departments`);
            return res.status(400).json({
                error: 'Cannot delete department that has child departments'
            });
        }

        // Then check if there are any employees in this department
        const [employees] = await db.query(
            'SELECT ID FROM EMPLOYEE WHERE DEPTID = ?',
            [req.params.id]
        );

        if (employees.length > 0) {
            logger.warn(`Cannot delete department ${req.params.id}: has employees`);
            return res.status(400).json({
                error: 'Cannot delete department that has employees'
            });
        }

        // If no children and no employees, proceed with deletion
        const [result] = await db.query(
            'DELETE FROM DEPARTMENT WHERE DEPTID = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            logger.warn(`Department not found with ID: ${req.params.id}`);
            return res.status(404).json({ error: 'Department not found' });
        }

        logger.info(`Deleted department with ID: ${req.params.id}`);
        res.json({ message: 'Department deleted successfully' });
    } catch (error) {
        logger.error(`Error deleting department ${req.params.id}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
