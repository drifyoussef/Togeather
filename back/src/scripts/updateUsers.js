// FILE: updateUsers.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

mongoose.connect('mongodb+srv://youssefdrif1:dDrZdxQ519mc4zMM@togeathercluster.h2rtsua.mongodb.net/?retryWrites=true&w=majority&appName=TogeatherCluster', { useNewUrlParser: true, useUnifiedTopology: true });

const userId = '670b9f0b10d3f13c110d130d'; // Replace with the user's ID
const newPassword = 'test'; // Replace with the new password

const updateUsers = async () => {
  try {
    const users = await User.find();
    for (const user of users) {
      if (!user.previews) {
        user.previews = [];
      }
      if (!user.messages) {
        user.messages = [];
      }
      await user.save();
    }
    console.log('Users updated successfully');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error updating users:', err);
    mongoose.connection.close();
  }
};

const updateUserPassword = async () => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.error('User not found');
      mongoose.connection.close();
      return;
    }

    // Update the user's password with the hashed password
    user.password = newPassword;
    await user.save();

    console.log('Password updated successfully');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error updating password:', err);
    mongoose.connection.close();
  }
};

// Call the function to update the user's password
updateUsers();
updateUserPassword();