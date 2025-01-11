const request = require('supertest');
const express = require('express');
const login = require('./login');

const app = express();
app.set('view engine', 'ejs');
app.get('/login', login);

describe('GET /login', () => {
    it('should render the login page', async () => {
        const res = await request(app).get('/login');

    });

    it('should return 200 status code', async () => {
        const res = await request(app).get('/login');

    });

    it('should return content-type text/html', async () => {
        const res = await request(app).get('/login');

        expect(res.headers['content-type']).toMatch(/html/);
    });
});