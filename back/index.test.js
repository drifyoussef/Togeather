const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const expressSession = require('express-session');
const http = require('http');
const socketIo = require('socket.io');
const authMiddleware = require('./src/middlewares/authMiddleware');
const redirectIfAuthenticatedMiddleware = require('./src/middlewares/redirectIfAuthenticatedMiddleware');
const newUserController = require('./src/controllers/newUser');
const logoutController = require('./src/controllers/logout');
const getUserController = require('./src/controllers/getUser');
const getUsersController = require('./src/controllers/getUsers');
const getUserByIdController = require('./src/controllers/getUserById');
const likeUserController = require('./src/controllers/likeUser');
const updateUserController = require('./src/controllers/updateUser');
const storeUserController = require('./src/controllers/storeUser');
const loginUserController = require('./src/controllers/loginUser');
const messagesRouter = require('./src/routes/messages');
const { createOrder, successPayments } = require('./src/services/paypal-api');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json());
app.use(cors());
app.use(expressSession({
    secret: 'fe148abed5bbff4b5ac65ca7fa298bd12f0ef6a82d0546b5cd4f05427aa2037d',
    resave: false,
    saveUninitialized: false,
}));

global.loggedIn = null;
app.use('*', (req, res, next) => {
    loggedIn = req.session.userId;
    next();
});

app.use('/messages', authMiddleware, messagesRouter);
app.get('/auth/register', redirectIfAuthenticatedMiddleware, newUserController);
app.get('/auth/logout', logoutController);
app.get('/auth/user', authMiddleware, getUserController);
app.get('/auth/users', authMiddleware, getUsersController);
app.get('/auth/users/:id', authMiddleware, getUserByIdController);
app.post('/users/register', redirectIfAuthenticatedMiddleware, storeUserController);
app.post('/users/login', redirectIfAuthenticatedMiddleware, loginUserController);
app.post('/auth/users/:id/like', authMiddleware, likeUserController);
app.post('/users/update', authMiddleware, updateUserController);
app.post('/create-paypal-order', createOrder);
app.post('/successPayments', successPayments);

describe('Express App', () => {
    it('should return Hello-world on GET /', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Hello-world');
    });

    it('should register a user on POST /users/register', async () => {
        const res = await request(app)
            .post('/users/register')
            .send({ username: 'testuser', password: 'password123' });
        expect(res.statusCode).toEqual(302); // Assuming it redirects after registration
    });

    it('should login a user on POST /users/login', async () => {
        const res = await request(app)
            .post('/users/login')
            .send({ username: 'testuser', password: 'password123' });
        expect(res.statusCode).toEqual(302); // Assuming it redirects after login
    });

    it('should get user data on GET /auth/user', async () => {
        const res = await request(app)
            .get('/auth/user')
            .set('Authorization', 'Bearer testToken'); // Assuming you use Bearer token for auth
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('user');
    });

    it('should get users data on GET /auth/users', async () => {
        const res = await request(app)
            .get('/auth/users')
            .set('Authorization', 'Bearer testToken'); // Assuming you use Bearer token for auth
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Array);
    });
});