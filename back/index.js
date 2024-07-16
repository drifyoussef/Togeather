const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const expressSession = require('express-session')
const newUserController = require('./src/controllers/newUser');
const storeUserController = require('./src/controllers/storeUser');
const loginController = require('./src/controllers/login');
const loginUserController = require('./src/controllers/loginUser');
const authMiddleware = require('./src/middlewares/authMiddleware');
const redirectIfAuthenticatedMiddleware = require('./src/middlewares/redirectIfAuthenticatedMiddleware')
const logoutController = require('./src/controllers/logout');
const getUserController = require('./src/controllers/getUser');
const fetch = require('node-fetch');

const app = express();

// Middleware to parse JSON
app.use(express.json());
app.use(cors());
app.use(expressSession({
    secret: 'fe148abed5bbff4b5ac65ca7fa298bd12f0ef6a82d0546b5cd4f05427aa2037d',
    resave: false,
    saveUninitialized: false,
}))

global.loggedIn = null;
app.use('*', (req, res, next) => {
    loggedIn = req.session.userId;
    next()
})

//Définition des CORS Middleware 
app.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type, Accept,Authorization,Origin");
    res.setHeader("Access-Control-Allow-Origin", process.env.ORIGIN);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Credentials", true);
    next();
  });

app.get('/auth/register', redirectIfAuthenticatedMiddleware, newUserController);
app.get('/auth/logout', logoutController);
app.get('/auth/user', authMiddleware, getUserController);

app.get('/', function (req, res) {
    res.send("Hello-world");
})

app.get('/api/restaurants', async (req, res) => {
    try {
        const { location, radius } = req.query;
        const response = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&type=restaurant&key=AIzaSyA8YrxzYR9Gix93tZ-x4aVIekH4EGoQhx4`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/users/register', redirectIfAuthenticatedMiddleware, storeUserController);
app.post('/users/login', redirectIfAuthenticatedMiddleware, loginUserController);

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
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
