module.exports = {
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'hrmsdb',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        sslMode: process.env.DB_SSL_MODE || 'prefer',
        allowPublicKeyRetrieval: true
    },
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        filename: 'logs/hrms.log',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        format: {
            timestamp: true,
            colorize: true
        }
    },
    server: {
        port: process.env.PORT || 3000,
        clientPort: process.env.CLIENT_PORT || 3001
    }
}
