const User = require('../models/User');

module.exports = async (req, res) => {
    try {
        // Récupération de l'utilisateur connecté
        const userReq = req.user;
        // Recherche de l'utilisateur en base de données sans le mot de passe
        const user = await User.findById(userReq._id).select('-password');
        if (!user) {
            // Si l'utilisateur n'existe pas, on renvoie une erreur 404
            return res.status(404).json({ message: 'User not found' });
        }
        // Sinon, on renvoie l'utilisateur
        res.status(200).json(user);
    } catch (error) {
        // En cas d'erreur, on renvoie une erreur 500
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Error fetching user.' });
    }
};
