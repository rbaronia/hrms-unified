const db = require('../utils/db/connection');
const logger = require('../utils/logger');

class DatabaseService {
    constructor() {
        this.db = db;
    }

    // Generic query with error handling and logging
    async query(sql, params = []) {
        try {
            const [results] = await this.db.query(sql, params);
            return results;
        } catch (error) {
            logger.error('Database query error:', { sql, params, error: error.message });
            throw error;
        }
    }

    // Transaction wrapper
    async transaction(callback) {
        const connection = await this.db.getConnection();
        try {
            await connection.beginTransaction();
            const result = await callback(connection);
            await connection.commit();
            return result;
        } catch (error) {
            await connection.rollback();
            logger.error('Transaction error:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    // Prepared statement wrapper
    async prepared(sql, params = []) {
        try {
            const [results] = await this.db.execute(sql, params);
            return results;
        } catch (error) {
            logger.error('Prepared statement error:', { sql, params, error: error.message });
            throw error;
        }
    }

    // Pagination helper
    async paginate(sql, params = [], page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const countSql = sql.replace(/SELECT .* FROM/, 'SELECT COUNT(*) as count FROM').split('ORDER BY')[0];
        
        try {
            const [countResult] = await this.query(countSql, params);
            const totalItems = countResult[0].count;
            const totalPages = Math.ceil(totalItems / limit);

            const results = await this.query(`${sql} LIMIT ? OFFSET ?`, [...params, limit, offset]);

            return {
                data: results,
                pagination: {
                    page,
                    limit,
                    totalItems,
                    totalPages
                }
            };
        } catch (error) {
            logger.error('Pagination error:', { sql, params, error: error.message });
            throw error;
        }
    }

    // Search helper
    async search(table, fields, searchTerm, page = 1, limit = 10) {
        const whereClause = fields.map(field => `${field} LIKE ?`).join(' OR ');
        const params = fields.map(() => `%${searchTerm}%`);
        
        const sql = `SELECT * FROM ${table} WHERE ${whereClause}`;
        return this.paginate(sql, params, page, limit);
    }
}

module.exports = new DatabaseService();
