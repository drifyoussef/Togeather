const User = require('../models/User');

module.exports = async (req, res) => {
    try {
        // Récupération de tous les utilisateurs sans le mot de passe
        const users = await User.find().select('-password');
        //console.log(users, "users");
        res.status(200).json(users);
    } catch (error) {
        // En cas d'erreur, on renvoie une erreur 500
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users.' });
    }
};
