process.env.SECRET_KEY = 'your-secret-key-in-hex-format';
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const likeUser = require('./likeUser');

jest.mock('../models/User');

const app = express();
app.use(express.json());

app.post('/user/:id/like', likeUser);

describe('POST /user/:id/like', () => {
    beforeAll(() => {
        mongoose.connect = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 401 if currentUserId is not provided', async () => {
        const res = await request(app)
            .post('/user/12345/like')
            .send({ liked: true });

        expect(res.statusCode).toEqual(401);
        expect(res.body).toEqual({ message: 'Unauthorized' });
    });

    it('should return 404 if user to like is not found', async () => {
        User.findById.mockResolvedValueOnce(null);

        const res = await request(app)
            .post('/user/12345/like')
            .send({ liked: true, currentUserId: '67890' });

        expect(res.statusCode).toEqual(404);
        expect(res.body).toEqual({ message: 'User not found' });
    });

    it('should return 404 if current user is not found', async () => {
        User.findById.mockResolvedValueOnce({ _id: '12345', likedBy: [] });
        User.findById.mockResolvedValueOnce(null);

        const res = await request(app)
            .post('/user/12345/like')
            .send({ liked: true, currentUserId: '67890' });

        expect(res.statusCode).toEqual(404);
        expect(res.body).toEqual({ message: 'Current user not found' });
    });

    it('should like the user and return 200 with updated info', async () => {
        const mockUser = { _id: '12345', likedBy: [] };
        const mockCurrentUser = { _id: '67890', likedBy: [] };

        User.findById.mockResolvedValueOnce(mockUser);
        User.findById.mockResolvedValueOnce(mockCurrentUser);
        User.findById.mockResolvedValueOnce(mockUser);
        User.findById.mockResolvedValueOnce(mockCurrentUser);

        const res = await request(app)
            .post('/user/12345/like')
            .send({ liked: true, currentUserId: '67890' });

        expect(res.statusCode).toEqual(200);
    });

    it('should unlike the user and return 200 with updated info', async () => {
        const mockUser = { _id: '12345', likedBy: ['67890'] };
        const mockCurrentUser = { _id: '67890', likedBy: [] };

        User.findById.mockResolvedValueOnce(mockUser);
        User.findById.mockResolvedValueOnce(mockCurrentUser);
        User.findById.mockResolvedValueOnce(mockUser);
        User.findById.mockResolvedValueOnce(mockCurrentUser);

        const res = await request(app)
            .post('/user/12345/like')
            .send({ liked: false, currentUserId: '67890' });

        expect(res.statusCode).toEqual(200);
    });

    it('should return 500 if there is a server error', async () => {
        User.findById.mockRejectedValue(new Error('Server error'));

        const res = await request(app)
            .post('/user/12345/like')
            .send({ liked: true, currentUserId: '67890' });

        expect(res.statusCode).toEqual(500);
        expect(res.body).toEqual({ message: 'Error updating like status' });
    });
});