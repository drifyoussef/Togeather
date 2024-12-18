const mongoose = require('mongoose');
const User = require('../models/User');

mongoose.connect('mongodb+srv://youssefdrif1:dDrZdxQ519mc4zMM@togeathercluster.h2rtsua.mongodb.net/?retryWrites=true&w=majority&appName=TogeatherCluster', { useNewUrlParser: true, useUnifiedTopology: true });

const updateUserFields = async () => {
  try {
    const users = await User.find();
    for (const user of users) {
      // Met à jour les champs des utilisateurs
      if (!user.previews) {
        user.previews = [];
      }
      if (!user.messages) {
        user.messages = [];
      }
      if (user.isEmailConfirmed === undefined) user.isEmailConfirmed = false;

      await user.save();
    }
    console.log('Users updated successfully');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error updating users:', err);
    mongoose.connection.close();
  }
};

// Appelle la fonction pour mettre à jour les champs des utilisateurs
updateUserFields();