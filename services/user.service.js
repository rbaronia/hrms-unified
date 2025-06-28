const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const BaseService = require('./base.service');
const { ApiError } = require('../utils/errorHandler');
const db = require('../models');

class UserService extends BaseService {
    constructor() {
        super(db.User);
    }

    async create(userData) {
        // Check if user already exists
        const existingUser = await db.User.findOne({
            where: {
                [Op.or]: [{ email: userData.email }, { username: userData.username }],
            },
        });

        if (existingUser) {
            throw new ApiError(400, 'Email or username already in use');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        userData.password = await bcrypt.hash(userData.password, salt);

        // Create user
        return await super.create(userData);
    }

    async update(id, userData) {
        if (userData.password) {
            const salt = await bcrypt.genSalt(10);
            userData.password = await bcrypt.hash(userData.password, salt);
        }
        return await super.update(id, userData);
    }

    async findByEmail(email) {
        const user = await this.model.findOne({ where: { email } });
        if (!user) {
            throw new ApiError(404, 'User not found');
        }
        return user;
    }

    async validatePassword(user, password) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new ApiError(401, 'Invalid credentials');
        }
        return true;
    }

    async getUsersWithPagination(page = 1, limit = 10, search = '') {
        const offset = (page - 1) * limit;

        const whereClause = search
            ? {
                  [Op.or]: [
                      { name: { [Op.like]: `%${search}%` } },
                      { email: { [Op.like]: `%${search}%` } },
                      { username: { [Op.like]: `%${search}%` } },
                  ],
              }
            : {};

        const { count, rows } = await this.model.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            attributes: { exclude: ['password'] },
            include: [
                { model: db.Department, as: 'department' },
                { model: db.UserType, as: 'userType' },
            ],
            order: [['createdAt', 'DESC']],
        });

        return {
            total: count,
            page,
            totalPages: Math.ceil(count / limit),
            data: rows,
        };
    }
}

module.exports = new UserService();
