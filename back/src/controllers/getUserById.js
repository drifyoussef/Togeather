const User = require('../models/User');

module.exports = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`User ID received: ${id}`);
        const user = await User.findById(id).select('-password'); 

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ message: 'Error fetching user details (id):' });
    }
};
