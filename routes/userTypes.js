const express = require('express');
const router = express.Router();
const db = require('../utils/db/connection');
const logger = require('../utils/logger');

// Get all user types
router.get('/', async (req, res) => {
    try {
        logger.info('Fetching user types');
        const [userTypes] = await db.query(`
            SELECT 
                TYPEID as typeid,
                TYPENAME as typename
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

// Get user type by ID
router.get('/:id', async (req, res) => {
    try {
        const [userType] = await db.query(`
            SELECT 
                TYPEID as typeid,
                TYPENAME as typename
            FROM USERTYPE 
            WHERE TYPEID = ?
        `, [req.params.id]);

        if (userType.length === 0) {
            return res.status(404).json({ error: 'User type not found' });
        }

        res.json(userType[0]);
    } catch (error) {
        logger.error('Error retrieving user type:', error);
        res.status(500).json({ error: 'Failed to load user type' });
    }
});

// Create new user type
router.post('/', async (req, res) => {
    try {
        const { typename } = req.body;
        if (!typename) {
            return res.status(400).json({ error: 'User type name is required' });
        }
        try {
            const [result] = await db.query(
                'INSERT INTO USERTYPE (TYPENAME) VALUES (?)',
                [typename]
            );
            res.status(201).json({
                message: 'User type created successfully',
                typeid: result.insertId,
                typename
            });
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                logger.error('Duplicate user type name');
                return res.status(409).json({ error: 'User type name already exists' });
            } else if (err.code === 'ER_NO_DEFAULT_FOR_FIELD') {
                logger.error('User type creation failed: missing required field(s)');
                return res.status(400).json({ error: 'Missing required field(s) for user type' });
            }
            logger.error('Error creating user type:', err);
            res.status(500).json({ error: 'Internal server error', details: err.message });
        }
    } catch (error) {
        logger.error('Error creating user type:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Update user type by ID
router.put('/:id', async (req, res) => {
    try {
        const { typename } = req.body;
        if (!typename) {
            return res.status(400).json({ error: 'User type name is required' });
        }
        // Attempt to update
        const [result] = await db.query('UPDATE USERTYPE SET TYPENAME = ? WHERE TYPEID = ?', [typename, req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User type not found' });
        }
        res.json({
            message: 'User type updated successfully',
            typeid: parseInt(req.params.id),
            typename
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            logger.error('Duplicate user type name');
            return res.status(409).json({ error: 'User type name already exists' });
        }
        logger.error('Error updating user type:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Delete user type by ID
router.delete('/:id', async (req, res) => {
    try {
        // Check if any users exist with this type
        const [userRows] = await db.query('SELECT ID FROM USER WHERE TYPEID = ?', [req.params.id]);
        if (userRows.length > 0) {
            return res.status(400).json({ error: 'Cannot delete user type as it is assigned to one or more users.' });
        }
        // Attempt to delete
        const [result] = await db.query('DELETE FROM USERTYPE WHERE TYPEID = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User type not found' });
        }
        res.status(204).send();
    } catch (error) {
        logger.error('Error deleting user type:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

module.exports = router;
