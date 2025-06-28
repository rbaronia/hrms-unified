const jwt = require('jsonwebtoken');
const userService = require('../services/user.service');
const { ApiError } = require('../utils/errorHandler');
const config = require('../config/config');

class AuthController {
    async register(req, res, next) {
        try {
            const user = await userService.create(req.body);

            // Generate JWT token
            const token = this.generateToken(user);

            // Set HTTP-only cookie
            this.setTokenCookie(res, token);

            // Remove password from response
            const { password, ...userWithoutPassword } = user.toJSON();

            res.status(201).json({
                success: true,
                data: userWithoutPassword,
                token,
            });
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;

            // Check if user exists
            const user = await userService.findByEmail(email);

            // Validate password
            await userService.validatePassword(user, password);

            // Generate JWT token
            const token = this.generateToken(user);

            // Set HTTP-only cookie
            this.setTokenCookie(res, token);

            // Remove password from response
            const { password: _, ...userWithoutPassword } = user.toJSON();

            res.json({
                success: true,
                data: userWithoutPassword,
                token,
            });
        } catch (error) {
            next(new ApiError(401, 'Invalid email or password'));
        }
    }

    logout(req, res) {
        // Clear the HTTP-only cookie
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });

        res.json({ success: true, message: 'Successfully logged out' });
    }

    generateToken(user) {
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
        };

        return jwt.sign(payload, config.security.jwtSecret, {
            expiresIn: config.security.jwtExpiresIn || '24h',
        });
    }

    setTokenCookie(res, token) {
        // Cookie expires in 7 days
        const cookieOptions = {
            httpOnly: true,
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        };

        res.cookie('token', token, cookieOptions);
    }
}

module.exports = new AuthController();
