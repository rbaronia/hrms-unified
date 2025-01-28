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

module.exports = router;
