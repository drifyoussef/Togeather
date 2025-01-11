process.env.SECRET_KEY = 'your-secret-key-in-hex-format';
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const getUser = require('./getUser');

jest.mock('../models/User');

const app = express();
app.use(express.json());

app.get('/auth/user', (req, res) => {
	req.user = { _id: '12345' }; // Mock user ID
	getUser(req, res);
});

describe('GET /auth/user', () => {
	beforeAll(() => {
		mongoose.connect = jest.fn();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should return 500 if there is a server error', async () => {

		const res = await request(app).get('/auth/user');

		expect(res.statusCode).toEqual(500);
		expect(res.body).toEqual({ message: 'Error fetching user.' });
		expect(User.findById).toHaveBeenCalledWith('12345');
	});
});