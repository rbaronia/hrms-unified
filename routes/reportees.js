const express = require('express');
const router = express.Router();
const db = require('../utils/db/connection');
const logger = require('../utils/logger');

// Get all reportees
router.get('/', async (req, res) => {
    try {
        logger.info('Fetching reportees');
        const [reportees] = await db.query(`
            SELECT 
                u.USERID as userid,
                u.FIRSTNAME as firstname,
                u.LASTNAME as lastname,
                m.USERID as manager
            FROM USER u
            LEFT JOIN USER m ON u.MANAGER = m.USERID
            WHERE u.ISMANAGER = '0'
            ORDER BY u.LASTNAME, u.FIRSTNAME
        `);
        
        logger.info(`Successfully retrieved ${reportees.length} reportees`);
        res.json(reportees);
    } catch (error) {
        logger.error('Error retrieving reportees:', error);
        res.status(500).json({ 
            error: 'Failed to load reportees',
            message: 'An error occurred while retrieving reportee data',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;
