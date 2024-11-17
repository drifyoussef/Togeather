const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const expressSession = require('express-session');
const newUserController = require('./src/controllers/newUser');
const storeUserController = require('./src/controllers/storeUser');
const loginController = require('./src/controllers/login');
const loginUserController = require('./src/controllers/loginUser');
const authMiddleware = require('./src/middlewares/authMiddleware');
const redirectIfAuthenticatedMiddleware = require('./src/middlewares/redirectIfAuthenticatedMiddleware');
const logoutController = require('./src/controllers/logout');
const getUserController = require('./src/controllers/getUser');
const getUsersController = require('./src/controllers/getUsers');
const getUserByIdController = require('./src/controllers/getUserById');
const likeUserController = require('./src/controllers/likeUser');
const messagesRouter = require('./src/routes/messages'); 
const Message = require('./src/models/Message');
const http = require('http');
const socketIo = require('socket.io');

let fetch;

(async () => {
    fetch = (await import('node-fetch')).default;

    const app = express();
    const server = http.createServer(app);
    const io = socketIo(server, {
        cors: {
          origin: "*", // Allow all origins
          methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected');
      
        socket.on('sendMessage', (message) => {
          io.emit('receiveMessage', message);
        });
      
        socket.on('disconnect', () => {
          console.log('Client disconnected');
        });
    });

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
    //Définition des CORS Middleware 
    app.use(function (req, res, next) {
        res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type, Accept,Authorization,Origin");
        res.setHeader("Access-Control-Allow-Origin", process.env.ORIGIN);
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
        res.setHeader("Access-Control-Allow-Credentials", true);
        next();
    });
    app.use('/messages', messagesRouter);

    app.get('/auth/register', redirectIfAuthenticatedMiddleware, newUserController);
    app.get('/auth/logout', logoutController);
    app.get('/auth/user', authMiddleware, getUserController);
    app.get('/auth/users', authMiddleware, getUsersController);
    app.get('/auth/users/:id', authMiddleware, getUserByIdController);
    app.get('/messages', async (req, res) => {
        try {
            const messages = await Message.find().populate('sender receiver');
            res.json(messages);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    app.get('/messages/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const messages = await Message.find({ $or: [{ sender: id }, { receiver: id }] }).populate('sender receiver');
            res.json(messages);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    app.get('/', function (req, res) {
        res.json({ message: "Hello-world" });
    });

    app.get('/api/restaurant/:place_id', async (req, res) => {
        try {
            const { place_id } = req.params;
            const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&key=${process.env.GOOGLE_API_KEY}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch restaurant details: ${response.statusText}`);
            }

            const data = await response.json();
            res.json(data);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    });


    app.get('/api/restaurants', async (req, res) => {
        try {
            const { location, radius, keyword } = req.query;
            let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&type=restaurant`;
            if (keyword) {
                url += `&keyword=${keyword}`;
            }
            url += `&key=${process.env.GOOGLE_API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/restaurant/photo/:photo_reference', async (req, res) => {
        try {
            const { photo_reference } = req.params;
            const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo_reference}&key=${process.env.GOOGLE_API_KEY}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch photo: ${response.statusText}`);
            }

            const buffer = await response.buffer(); // Get the image as a buffer
            const base64Image = buffer.toString('base64'); // Convert to base64 string

            // Send back the base64 string
            res.json({ base64Image });
        } catch (error) {
            console.error('Error fetching photo:', error);
            res.status(500).json({ error: error.message });
        }
    });


    app.get('/api/restaurants/asian', async (req, res) => {
        try {
            const { location, radius } = req.query;
            const response = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&type=restaurant&keyword=chinese&key=${process.env.GOOGLE_API_KEY}`);
            const data = await response.json();
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/restaurants/italian', async (req, res) => {
        try {
            const { location, radius } = req.query;
            const response = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&type=restaurant&keyword=italian&key=${process.env.GOOGLE_API_KEY}`);
            const data = await response.json();
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post('/users/register', redirectIfAuthenticatedMiddleware, storeUserController);
    app.post('/users/login', redirectIfAuthenticatedMiddleware, loginUserController);
    app.post('/auth/users/:id/like', authMiddleware, likeUserController);
    app.post('/messages', async (req, res) => {
        try {
            const { sender, receiver, text } = req.body;
            const message = new Message({ sender, receiver, text });
            await message.save();
            io.emit('receiveMessage', message);
            res.json(message);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    async function main() {
        try {
            await mongoose.connect('mongodb+srv://youssefdrif1:dDrZdxQ519mc4zMM@togeathercluster.h2rtsua.mongodb.net/?retryWrites=true&w=majority&appName=TogeatherCluster');
            console.log('Connected to MongoDB togeatherDb');
        } catch (error) {
            console.error('Connection error to MongoDB togeatherDb', error);
        }
    }

    main()
        .then(() => console.log('Database connection established'))
        .catch(console.error);

    const PORT = process.env.PORT || 4000;
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})();
