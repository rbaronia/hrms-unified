const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../utils/logger');

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;

    if (!token) {
        logger.warn('No token provided');
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, config.security.jwtSecret);
        req.user = decoded;
        next();
    } catch (error) {
        logger.error('Invalid token:', error);
        return res.status(401).json({ error: 'Invalid token' });
    }
};

const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            logger.warn('User not authenticated');
            return res.status(401).json({ error: 'User not authenticated' });
        }

        if (!roles.includes(req.user.role)) {
            logger.warn(`User ${req.user.id} attempted to access unauthorized resource`);
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        next();
    };
};

const isManager = (req, res, next) => {
    if (!req.user.isManager) {
        logger.warn(`Non-manager user ${req.user.id} attempted to access manager resource`);
        return res.status(403).json({ error: 'Manager access required' });
    }
    next();
};

module.exports = {
    verifyToken,
    checkRole,
    isManager
};
