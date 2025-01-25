const express = require('express');
const router = express.Router();
const db = require('../utils/db/connection');
const logger = require('../utils/logger');

// Get all user types
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM USERTYPE ORDER BY TYPEID');
        logger.info('Retrieved all user types');
        res.json(rows);
    } catch (error) {
        logger.error('Error retrieving user types:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user type by ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM USERTYPE WHERE TYPEID = ?', [req.params.id]);
        if (rows.length === 0) {
            logger.warn(`User type not found with ID: ${req.params.id}`);
            return res.status(404).json({ error: 'User type not found' });
        }
        logger.info(`Retrieved user type with ID: ${req.params.id}`);
        res.json(rows[0]);
    } catch (error) {
        logger.error(`Error retrieving user type ${req.params.id}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new user type
router.post('/', async (req, res) => {
    const { typeid, typename } = req.body;

    try {
        const [result] = await db.query(
            'INSERT INTO USERTYPE (TYPEID, TYPENAME) VALUES (?, ?)',
            [typeid, typename]
        );
        
        const [newType] = await db.query('SELECT * FROM USERTYPE WHERE TYPEID = ?', [result.insertId]);
        logger.info('Created new user type:', { typeid });
        res.status(201).json(newType[0]);
    } catch (error) {
        logger.error('Error creating user type:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update user type
router.put('/:id', async (req, res) => {
    const { typename } = req.body;

    try {
        const [result] = await db.query(
            'UPDATE USERTYPE SET TYPENAME = ? WHERE TYPEID = ?',
            [typename, req.params.id]
        );

        if (result.affectedRows === 0) {
            logger.warn(`User type not found with ID: ${req.params.id}`);
            return res.status(404).json({ error: 'User type not found' });
        }

        const [updatedType] = await db.query('SELECT * FROM USERTYPE WHERE TYPEID = ?', [req.params.id]);
        logger.info(`Updated user type with ID: ${req.params.id}`);
        res.json(updatedType[0]);
    } catch (error) {
        logger.error(`Error updating user type ${req.params.id}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete user type
router.delete('/:id', async (req, res) => {
    try {
        // First check if there are any employees using this user type
        const [employees] = await db.query(
            'SELECT ID FROM EMPLOYEE WHERE TYPEID = ?',
            [req.params.id]
        );

        if (employees.length > 0) {
            logger.warn(`Cannot delete user type ${req.params.id}: has employees`);
            return res.status(400).json({
                error: 'Cannot delete user type that has employees assigned'
            });
        }

        const [result] = await db.query(
            'DELETE FROM USERTYPE WHERE TYPEID = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            logger.warn(`User type not found with ID: ${req.params.id}`);
            return res.status(404).json({ error: 'User type not found' });
        }

        logger.info(`Deleted user type with ID: ${req.params.id}`);
        res.json({ message: 'User type deleted successfully' });
    } catch (error) {
        logger.error(`Error deleting user type ${req.params.id}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
