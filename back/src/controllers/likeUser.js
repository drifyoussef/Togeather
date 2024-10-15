const User = require('../models/User');

module.exports = async (req, res) => {
    try {
        const { id } = req.params; // ID de l'utilisateur qui est liké/pas liké
        const currentUserId = req.session.userId; // ID de l'utilisateur connecté

        if (!currentUserId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        console.log(`User ID to like/unlike: ${id}`);
        const user = await User.findById(id); // Recupère l'utilisateur

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('User fetched:', user); // log de user

        const hasLiked = user.likedBy.includes(currentUserId);

        if (hasLiked) {
            // Si il l'a déjà liké, le unlike
            await User.findByIdAndUpdate(id, { $pull: { likedBy: currentUserId } });
            console.log(`User ${currentUserId} unliked ${id}`);
        } else {
            // Sinon il le like
            await User.findByIdAndUpdate(id, { $addToSet: { likedBy: currentUserId } });
            console.log(`User ${currentUserId} liked ${id}`);
        }

        // Recupère l'utilisateur pour voir si il a des like mutuel
        const currentUser = await User.findById(currentUserId);
        const isMutual = user.likedBy.includes(currentUserId) && currentUser.likedBy.includes(id);

        res.status(200).json({
            message: hasLiked ? 'User unliked' : 'User liked',
            liked: !hasLiked,
            totalLikes: user.likedBy.length,
            isMutual: isMutual,
        });
    } catch (error) {
        console.error('Error updating like status:', error);
        res.status(500).json({ message: 'Error updating like status' });
    }
};
