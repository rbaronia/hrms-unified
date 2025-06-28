const userService = require('../services/user.service');
const { ApiError } = require('../utils/errorHandler');

class UserController {
    async getAllUsers(req, res, next) {
        try {
            const { page = 1, limit = 10, search = '' } = req.query;
            const result = await userService.getUsersWithPagination(
                parseInt(page),
                parseInt(limit),
                search
            );
            res.json({
                success: true,
                data: result.data,
                pagination: {
                    total: result.total,
                    page: result.page,
                    totalPages: result.totalPages,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    async getUserById(req, res, next) {
        try {
            const user = await userService.findById(req.params.id, {
                attributes: { exclude: ['password'] },
                include: [
                    { model: db.Department, as: 'department' },
                    { model: db.UserType, as: 'userType' },
                ],
            });
            res.json({ success: true, data: user });
        } catch (error) {
            next(error);
        }
    }

    async createUser(req, res, next) {
        try {
            const user = await userService.create(req.body);
            // Remove password from response
            const { password, ...userWithoutPassword } = user.toJSON();
            res.status(201).json({
                success: true,
                data: userWithoutPassword,
            });
        } catch (error) {
            next(error);
        }
    }

    async updateUser(req, res, next) {
        try {
            const user = await userService.update(req.params.id, req.body);
            // Remove password from response
            const { password, ...userWithoutPassword } = user.toJSON();
            res.json({
                success: true,
                data: userWithoutPassword,
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteUser(req, res, next) {
        try {
            await userService.delete(req.params.id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    async getCurrentUser(req, res, next) {
        try {
            // req.user is set by the auth middleware
            const user = await userService.findById(req.user.id, {
                attributes: { exclude: ['password'] },
                include: [
                    { model: db.Department, as: 'department' },
                    { model: db.UserType, as: 'userType' },
                ],
            });
            res.json({ success: true, data: user });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController();
