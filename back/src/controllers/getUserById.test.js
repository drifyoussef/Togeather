process.env.SECRET_KEY = 'your-secret-key-in-hex-format';
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const getUserById = require('./getUserById');

jest.mock('../models/User');

const app = express();
app.use(express.json());

app.get('/user/:id', getUserById);

describe('GET /user/:id', () => {
    beforeAll(() => {
        mongoose.connect = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 200 and the user if found', async () => {

        await request(app).get('/user/12345');
        expect(User.findById).toHaveBeenCalledWith('12345');
    });

    it('should return 404 if user is not found', async () => {
        User.findById.mockResolvedValue(null);

        await request(app).get('/user/12345');

        expect(User.findById).toHaveBeenCalledWith('12345');
    });

    it('should return 500 if there is a server error', async () => {

        const res = await request(app).get('/user/12345');

        expect(res.statusCode).toEqual(500);
        expect(res.body).toEqual({ message: 'Error fetching user details (id):' });
        expect(User.findById).toHaveBeenCalledWith('12345');
    });

    it('should return 400 if the user ID is invalid', async () => {
        const res = await request(app).get('/user/invalid-id');

    });

    it('should return 200 and the user without password field', async () => {
        const mockUser = { _id: '12345', name: 'John Doe', password: 'hashedpassword' };

        const res = await request(app).get('/user/12345');
        expect(res.body).not.toHaveProperty('password');
        expect(User.findById).toHaveBeenCalledWith('12345');
    });
});