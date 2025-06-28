const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const config = require('./config/config');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'HRMS Unified API',
            version: '1.0.0',
            description: 'Comprehensive Human Resource Management System API',
            contact: {
                name: 'API Support',
                email: 'support@hrms.com',
            },
        },
        servers: [
            {
                url: `http://localhost:${config.server.port}/api`,
                description: 'Development server',
            },
            {
                url: 'https://api.hrms.com/v1',
                description: 'Production server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            example: 1,
                        },
                        username: {
                            type: 'string',
                            example: 'johndoe',
                        },
                        email: {
                            type: 'string',
                            example: 'john@example.com',
                        },
                        firstName: {
                            type: 'string',
                            example: 'John',
                        },
                        lastName: {
                            type: 'string',
                            example: 'Doe',
                        },
                        role: {
                            type: 'string',
                            enum: ['admin', 'manager', 'employee'],
                            example: 'employee',
                        },
                        departmentId: {
                            type: 'integer',
                            example: 1,
                        },
                        isActive: {
                            type: 'boolean',
                            example: true,
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false,
                        },
                        message: {
                            type: 'string',
                            example: 'Error message',
                        },
                        errors: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    field: {
                                        type: 'string',
                                        example: 'email',
                                    },
                                    message: {
                                        type: 'string',
                                        example: 'Invalid email format',
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./routes/*.js', './controllers/*.js', './models/*.js'],
};

const specs = swaggerJsdoc(options);

const swaggerOptions = {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'HRMS API Documentation',
    customfavIcon: '/favicon.ico',
};

module.exports = {
    serve: swaggerUi.serve,
    setup: swaggerUi.setup(specs, swaggerOptions),
    specs,
};

// Add response schemas for common responses
module.exports.responses = {
    200: {
        description: 'Success',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        data: { type: 'object' },
                        message: { type: 'string', example: 'Operation successful' },
                    },
                },
            },
        },
    },
    201: {
        description: 'Created',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        data: { type: 'object' },
                        message: { type: 'string', example: 'Resource created successfully' },
                    },
                },
            },
        },
    },
    204: {
        description: 'No Content',
    },
    400: {
        description: 'Bad Request',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/Error',
                },
                example: {
                    success: false,
                    message: 'Validation failed',
                    errors: [
                        {
                            field: 'email',
                            message: 'Invalid email format',
                        },
                    ],
                },
            },
        },
    },
    401: {
        description: 'Unauthorized',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/Error',
                },
                example: {
                    success: false,
                    message: 'Authentication required',
                },
            },
        },
    },
    403: {
        description: 'Forbidden',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/Error',
                },
                example: {
                    success: false,
                    message: 'Insufficient permissions',
                },
            },
        },
    },
    404: {
        description: 'Not Found',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/Error',
                },
                example: {
                    success: false,
                    message: 'Resource not found',
                },
            },
        },
    },
    409: {
        description: 'Conflict',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/Error',
                },
                example: {
                    success: false,
                    message: 'Resource already exists',
                },
            },
        },
    },
    422: {
        description: 'Unprocessable Entity',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/Error',
                },
                example: {
                    success: false,
                    message: 'Validation failed',
                    errors: [
                        {
                            field: 'password',
                            message: 'Password must be at least 8 characters long',
                        },
                    ],
                },
            },
        },
    },
    429: {
        description: 'Too Many Requests',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/Error',
                },
                example: {
                    success: false,
                    message: 'Too many requests, please try again later',
                },
            },
        },
    },
    500: {
        description: 'Internal Server Error',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/Error',
                },
                example: {
                    success: false,
                    message: 'Internal server error',
                    ...(process.env.NODE_ENV === 'development' && {
                        stack: 'Error stack trace',
                    }),
                },
            },
        },
    },
};

// Helper function to generate API documentation for controllers
module.exports.generateApiDocs = (options = {}) => {
    const {
        tags = [],
        summary = '',
        description = '',
        parameters = [],
        requestBody = null,
        responses = {},
        security = [],
    } = options;

    return {
        tags,
        summary,
        description,
        parameters,
        requestBody,
        responses: {
            ...module.exports.responses,
            ...responses,
        },
        security: security.length > 0 ? security : undefined,
    };
};
