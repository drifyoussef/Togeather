process.env.SECRET_KEY = 'your-secret-key-in-hex-format';
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const getUsers = require('./getUsers');

jest.mock('../models/User');

const app = express();
app.use(express.json());

app.get('/users', getUsers);

describe('GET /users', () => {
    beforeAll(() => {
        mongoose.connect = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 200 and all users without passwords', async () => {
        const mockUsers = [
            { _id: '12345', name: 'John Doe' },
            { _id: '67890', name: 'Jane Doe' }
        ];
        User.find.mockResolvedValue(mockUsers);

        await request(app).get('/users');
        expect(User.find).toHaveBeenCalledWith();
    });

    it('should return 500 if there is a server error', async () => {

        const res = await request(app).get('/users');

        expect(res.statusCode).toEqual(500);
        expect(res.body).toEqual({ message: 'Error fetching users.' });
        expect(User.find).toHaveBeenCalledWith();
    });

    it('should return an empty array if no users are found', async () => {
        User.find.mockResolvedValue([]);

        await request(app).get('/users');

        expect(User.find).toHaveBeenCalledWith();
    });

    it('should return users without the password field', async () => {
        const mockUsers = [
            { _id: '12345', name: 'John Doe', password: 'hashedpassword' },
            { _id: '67890', name: 'Jane Doe', password: 'hashedpassword' }
        ];
        User.find.mockResolvedValue(mockUsers);

        const res = await request(app).get('/users');
        expect(res.body).not.toContainEqual(expect.objectContaining({ password: expect.any(String) }));
        expect(User.find).toHaveBeenCalledWith();
    });
});