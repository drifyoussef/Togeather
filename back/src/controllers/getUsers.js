const User = require('../models/User');

module.exports = async (req, res) => {
    try {
        // You can add query parameters or filters here if needed
        const users = await User.find().select('-password'); // Fetch all users and exclude the password field
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};
