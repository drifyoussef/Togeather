const User = require('../models/User');

module.exports = async (req, res) => {
    try {
        // Récupération de l'utilisateur grâce à l'ID fourni dans les paramètres de la requête
        const { id } = req.params;
        console.log(`User ID received: ${id}`);
        // Recherche de l'utilisateur en base de données sans le mot de passe
        const user = await User.findById(id).select('-password'); 

        if (!user) {
            // Si l'utilisateur n'existe pas, on renvoie une erreur 404
            return res.status(404).json({ message: 'User not found' });
        }
        // Sinon, on renvoie l'utilisateur
        res.status(200).json(user);
    } catch (error) {
        // En cas d'erreur, on renvoie une erreur 500
        console.error('Error fetching user details:', error);
        res.status(500).json({ message: 'Error fetching user details (id):' });
    }
};
