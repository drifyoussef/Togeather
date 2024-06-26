const User = require('../models/User');

module.exports = async (req, res) => {
    try {
        const userReq = req.user;
        const user = await User.findById(userReq._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};
