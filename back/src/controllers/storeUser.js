// src/controllers/storeUser.js
const User = require('../models/User');

module.exports = async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.status(201).json(user);
    } catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).json({ errors: error.errors });
        } else {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
};
