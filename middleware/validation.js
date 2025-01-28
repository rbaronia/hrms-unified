const { validationResult, body } = require('express-validator');
const logger = require('../utils/logger');

// Validation middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn('Validation failed:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// User validation rules
const userValidationRules = {
    create: [
        body('firstname').trim().notEmpty().withMessage('First name is required'),
        body('lastname').trim().notEmpty().withMessage('Last name is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters')
            .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])/)
            .withMessage('Password must include one lowercase letter, one uppercase letter, one number, and one special character'),
        body('deptid').isInt().withMessage('Valid department ID is required'),
        body('typeid').isInt().withMessage('Valid user type ID is required'),
    ],
    update: [
        body('firstname').optional().trim().notEmpty().withMessage('First name cannot be empty'),
        body('lastname').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
        body('email').optional().isEmail().withMessage('Valid email is required'),
        body('password')
            .optional()
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters')
            .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])/)
            .withMessage('Password must include one lowercase letter, one uppercase letter, one number, and one special character'),
        body('deptid').optional().isInt().withMessage('Valid department ID is required'),
        body('typeid').optional().isInt().withMessage('Valid user type ID is required'),
    ]
};

// Department validation rules
const departmentValidationRules = {
    create: [
        body('deptname').trim().notEmpty().withMessage('Department name is required'),
        body('parentid').optional().isInt().withMessage('Parent ID must be an integer'),
    ],
    update: [
        body('deptname').optional().trim().notEmpty().withMessage('Department name cannot be empty'),
        body('parentid').optional().isInt().withMessage('Parent ID must be an integer'),
    ]
};

// User type validation rules
const userTypeValidationRules = {
    create: [
        body('typename').trim().notEmpty().withMessage('Type name is required'),
        body('description').optional().trim(),
    ],
    update: [
        body('typename').optional().trim().notEmpty().withMessage('Type name cannot be empty'),
        body('description').optional().trim(),
    ]
};

module.exports = {
    validate,
    userValidationRules,
    departmentValidationRules,
    userTypeValidationRules
};
