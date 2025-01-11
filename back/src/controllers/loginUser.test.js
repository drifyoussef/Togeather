process.env.SECRET_KEY = 'your-secret-key-in-hex-format';
const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const appRoot = require('app-root-path');
const fs = require('fs');
const User = require('../models/User');
const loginUser = require('./loginUser');

jest.mock('../models/User');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('fs');

const app = express();
app.use(express.json());
app.post('/login', loginUser);

describe('POST /login', () => {
    beforeAll(() => {
        fs.readFileSync.mockReturnValue('privateKey');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 200 and a token if login is successful', async () => {
        const mockUser = {
            _id: '12345',
            email: 'test@example.com',
            password: 'hashedpassword',
            isEmailConfirmed: true,
            firstname: 'John',
        };
        User.findOne.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue('token');

        await request(app)
            .post('/login')
            .send({ email: 'test@example.com', password: 'password' });
        });

    it('should return 401 if email is not confirmed', async () => {
        const mockUser = {
            _id: '12345',
            email: 'test@example.com',
            password: 'hashedpassword',
            isEmailConfirmed: false,
            resendConfirmationEmail: jest.fn(),
        };
        User.findOne.mockResolvedValue(mockUser);

        const res = await request(app)
            .post('/login')
            .send({ email: 'test@example.com', password: 'password' });

        expect(res.statusCode).toEqual(401);
        expect(res.body).toEqual({ message: 'Email non confirmé', emailNotConfirmed: true });
        expect(mockUser.resendConfirmationEmail).toHaveBeenCalled();
    });

    it('should return 401 if password is incorrect', async () => {
        const mockUser = {
            _id: '12345',
            email: 'test@example.com',
            password: 'hashedpassword',
            isEmailConfirmed: true,
        };
        User.findOne.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(false);

        const res = await request(app)
            .post('/login')
            .send({ email: 'test@example.com', password: 'wrongpassword' });

        expect(res.statusCode).toEqual(401);
        expect(res.body).toEqual({ message: 'Email ou mot de passe invalide' });
    });

    it('should return 401 if user is not found', async () => {
        User.findOne.mockResolvedValue(null);

        const res = await request(app)
            .post('/login')
            .send({ email: 'nonexistent@example.com', password: 'password' });

        expect(res.statusCode).toEqual(401);
        expect(res.body).toEqual({ message: 'Email ou mot de passe invalide' });
    });

    it('should return 500 if there is a server error', async () => {
        User.findOne.mockRejectedValue(new Error('Server error'));

        const res = await request(app)
            .post('/login')
            .send({ email: 'test@example.com', password: 'password' });

        expect(res.statusCode).toEqual(500);
        expect(res.body).toEqual({ message: 'Erreur lors du login.' });
    });
});