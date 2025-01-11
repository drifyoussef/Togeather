const request = require('supertest');
const express = require('express');
const session = require('express-session');
const logout = require('./logout');

const app = express();
app.use(session({ secret: 'testsecret', resave: false, saveUninitialized: true }));
app.get('/logout', logout);

describe('GET /logout', () => {
    it('should destroy the session and redirect to /connection', async () => {
        const res = await request(app).get('/logout');

        expect(res.statusCode).toEqual(302);
        expect(res.headers.location).toBe('/connection');
    });

    it('should destroy the session', async () => {
        const req = { session: { destroy: jest.fn(callback => callback()) } };
        const res = { redirect: jest.fn() };

        await logout(req, res);

        expect(req.session.destroy).toHaveBeenCalled();
        expect(res.redirect).toHaveBeenCalledWith('/connection');
    });

    it('should handle session destruction errors gracefully', async () => {
        const req = { session: { destroy: jest.fn(callback => callback(new Error('Session destruction error'))) } };
        const res = { redirect: jest.fn() };

        await logout(req, res);

        expect(req.session.destroy).toHaveBeenCalled();
        expect(res.redirect).toHaveBeenCalledWith('/connection');
    });
});