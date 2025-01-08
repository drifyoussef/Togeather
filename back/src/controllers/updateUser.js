const User = require('../models/User'); // Adjust the path to your User model

module.exports = async (req, res) => {
    try {
        // Recupère les données du body
        const { userId, imageUrl, firstname, name, email, userGender, preferredGender, favoriteCategory, age, job, passions } = req.body;

        // Recupère le userId dans les paramètres de la requête et met à jour les données de l'utilisateur
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { imageUrl, firstname, name, email, userGender, preferredGender, favoriteCategory, age, job, passions },
            { new: true }
        );

        // Si l'utilisateur n'existe pas, on renvoie une erreur 404
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Sinon, on renvoie l'utilisateur mis à jour
        res.status(200).json(updatedUser);
    } catch (error) {
        // En cas d'erreur, on renvoie une erreur 500
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error updating user.' });
    }
};