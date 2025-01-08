const User = require('../models/User');

module.exports = async (req, res) => {
  try {
    const { id } = req.params;  // ID de l'utilisateur à liker
    const { liked, currentUserId } = req.body;  // liked: true pour liker, false pour unliker

    console.log(currentUserId, "ID DE L'UTILISATEUR LIKEUSER CONTROLLER");

    // Vérifier si l'utilisateur est connecté
    if (!currentUserId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    console.log(`User ID to like/unlike: ${id}`);
    const user = await User.findById(id);  // Récupérer l'utilisateur à liker

    // Vérifier si l'utilisateur existe
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = await User.findById(currentUserId);  // Récupérer l'utilisateur connecté

    // Vérifier si l'utilisateur connecté existe
    if (!currentUser) {
      return res.status(404).json({ message: 'Current user not found' });
    }

    if (liked) {
      // Liker l'utilisateur
      await User.findByIdAndUpdate(id, { $addToSet: { likedBy: currentUserId } });
      console.log(`User ${currentUserId} liked ${id}`);
    } else {
      // Unliker l'utilisateur
      await User.findByIdAndUpdate(id, { $pull: { likedBy: currentUserId } });
      console.log(`User ${currentUserId} unliked ${id}`);
    }

    // Récupérer les informations mises à jour des utilisateurs
    const updatedUser = await User.findById(id);
    const updatedCurrentUser = await User.findById(currentUserId);

    // Vérifier si les utilisateurs sont mutuellement likés
    const isMutual = updatedUser.likedBy.includes(currentUserId) && updatedCurrentUser.likedBy.includes(id);

    // Mettre à jour le statut de like mutuel
    await User.findByIdAndUpdate(currentUserId, { isMutual: isMutual });
    await User.findByIdAndUpdate(id, { isMutual: isMutual });

    // Répondre avec un message de succès et les informations mises à jour
    res.status(200).json({
      message: liked ? 'User liked' : 'User unliked',
      liked: liked,  // Statut de like
      totalLikes: updatedUser.likedBy.length,
      isMutual: isMutual,  // Statut de like mutuel
    });
  } catch (error) {
    // En cas d'erreur, on renvoie une erreur 500
    console.error('Error updating like status:', error);
    res.status(500).json({ message: 'Error updating like status' });
  }
};