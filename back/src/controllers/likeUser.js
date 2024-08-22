const User = require('../models/User');

module.exports = async (req, res) => {
    try {
        const { id } = req.params; // ID de l'utilisateur qui est liké/pas liké
        const currentUserId = req.session.userId; // ID de l'utilisateur connecté

        if (!currentUserId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        console.log(`User ID to like/unlike: ${id}`);
        const user = await User.findById(id).select('-password'); // Recupère l'utilisateur sans le mdp

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('User fetched:', user); // log de user

        // Vérifie si likedBy est un tableau
        if (!Array.isArray(user.likedBy)) {
            user.likedBy = []; // Initialise likedBy comme un tableau vide si il est undefined (valeur par défaut)
        }

        // Vérifie si l'utilisateur connecté a liké un utilisateur ou pas
        const hasLiked = user.likedBy.includes(currentUserId);

        if (hasLiked) {
            // Si il l'a déjà liké, le unlike
            user.likedBy.pull(currentUserId);
            console.log(`User ${currentUserId} unliked ${id}`);
        } else {
            // Sinon il le like
            user.likedBy.push(currentUserId);
            console.log(`User ${currentUserId} liked ${id}`);
        }

        // Recupère l'utilisateur pour voir si il a des like mutuel
        const currentUser = await User.findById(currentUserId).select('-password');
        if (!currentUser) {
            return res.status(404).json({ message: 'Current user not found' });
        }

        // Vérifie la variable likeBy de l'utilisateur actuel
        if (!Array.isArray(currentUser.likedBy)) {
            currentUser.likedBy = [];
        }

        // Vérifie les like mutuel
        const isMutual = user.likedBy.includes(currentUserId) && currentUser.likedBy.includes(id);

        await user.save(); // Sauvegarde les likes

        res.status(200).json({
            message: hasLiked ? 'Utilisateur non liké' : 'Utilisateur liké',
            liked: !hasLiked,
            totalLikes: user.likedBy.length, // Retourne le nombre de likes que l'utilisateur a
            isMutual: isMutual
        });
    } catch (error) {
        console.error('Error fetching user details or updating like status:', error);
        res.status(500).json({ message: 'Error fetching user details or updating like status' });
    }
};
