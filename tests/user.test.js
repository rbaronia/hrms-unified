const request = require('supertest');
const app = require('../server');
const dbService = require('../services/db.service');

describe('User API Endpoints', () => {
    beforeEach(async () => {
        // Clear users table before each test
        await dbService.query('DELETE FROM USER');
    });

    describe('POST /api/users', () => {
        it('should create a new user', async () => {
            const userData = {
                firstname: 'John',
                lastname: 'Doe',
                email: 'john.doe@example.com',
                password: 'Password123!',
                deptid: 1,
                typeid: 1
            };

            const response = await request(app)
                .post('/api/users')
                .send(userData)
                .expect(201);

            expect(response.body).toHaveProperty('userid');
            expect(response.body.firstname).toBe(userData.firstname);
            expect(response.body.lastname).toBe(userData.lastname);
        });

        it('should validate required fields', async () => {
            const response = await request(app)
                .post('/api/users')
                .send({})
                .expect(400);

            expect(response.body).toHaveProperty('errors');
            expect(response.body.errors).toBeInstanceOf(Array);
        });
    });

    describe('GET /api/users', () => {
        it('should return paginated users', async () => {
            // Create test users first
            const testUsers = [
                { firstname: 'John', lastname: 'Doe', email: 'john@example.com' },
                { firstname: 'Jane', lastname: 'Doe', email: 'jane@example.com' }
            ];

            for (const user of testUsers) {
                await dbService.query(
                    'INSERT INTO USER (firstname, lastname, email) VALUES (?, ?, ?)',
                    [user.firstname, user.lastname, user.email]
                );
            }

            const response = await request(app)
                .get('/api/users?page=1&limit=10')
                .expect(200);

            expect(response.body).toHaveProperty('data');
            expect(response.body).toHaveProperty('pagination');
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBe(2);
        });
    });
});
