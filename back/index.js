const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const expressSession = require('express-session')
const newUserController = require('./src/controllers/newUser');
const storeUserController = require('./src/controllers/storeUser');
const loginController = require('./src/controllers/login');
const loginUserController = require('./src/controllers/loginUser');

const app = express();

// Middleware to parse JSON
app.use(express.json());
app.use(cors());
app.use(expressSession({
    secret: 'fe148abed5bbff4b5ac65ca7fa298bd12f0ef6a82d0546b5cd4f05427aa2037d',
    resave: false,
    saveUninitialized: false,
}))

app.get('/auth/register', newUserController);
app.get('/auth/login', loginController);

app.post('/users/register', storeUserController);
app.post('/users/login', loginUserController);

async function main() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/togeatherDb');
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
