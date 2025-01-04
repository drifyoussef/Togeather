const User = require('../models/User');

module.exports = async (req, res) => {
  try {
    const { id } = req.params;  // ID of the user being liked/unliked
    const { liked, currentUserId } = req.body;  // Whether to like or unlike

    console.log(currentUserId, "ID DE L'UTILISATEUR LIKEUSER CONTROLLER");

    if (!currentUserId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    console.log(`User ID to like/unlike: ${id}`);
    const user = await User.findById(id);  // Fetch the user being liked/unliked

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = await User.findById(currentUserId);  // Fetch the logged-in user

    if (!currentUser) {
      return res.status(404).json({ message: 'Current user not found' });
    }

    if (liked) {
      // Like the user
      await User.findByIdAndUpdate(id, { $addToSet: { likedBy: currentUserId } });
      console.log(`User ${currentUserId} liked ${id}`);
    } else {
      // Unlike the user
      await User.findByIdAndUpdate(id, { $pull: { likedBy: currentUserId } });
      console.log(`User ${currentUserId} unliked ${id}`);
    }

    // Re-fetch both users after updating
    const updatedUser = await User.findById(id);
    const updatedCurrentUser = await User.findById(currentUserId);

    // Check for mutual like after update
    const isMutual = updatedUser.likedBy.includes(currentUserId) && updatedCurrentUser.likedBy.includes(id);

    // Update the mutual status for both users if needed
    await User.findByIdAndUpdate(currentUserId, { isMutual: isMutual });
    await User.findByIdAndUpdate(id, { isMutual: isMutual });

    res.status(200).json({
      message: liked ? 'User liked' : 'User unliked',
      liked: liked,  // Return the current like status
      totalLikes: updatedUser.likedBy.length,
      isMutual: isMutual,  // Updated mutual like status
    });
  } catch (error) {
    console.error('Error updating like status:', error);
    res.status(500).json({ message: 'Error updating like status' });
  }
};