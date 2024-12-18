const User = require('../models/User'); // Adjust the path to your User model

module.exports = async (req, res) => {
    try {
        const { userId, imageUrl, firstname, name, email, userGender, preferredGender, favoriteCategory, age, job, passions } = req.body;

        // Find the user by ID and update the fields
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { imageUrl, firstname, name, email, userGender, preferredGender, favoriteCategory, age, job, passions },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error updating user.' });
    }
};