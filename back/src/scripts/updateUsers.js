const mongoose = require('mongoose');
const User = require('../models/User');

mongoose.connect('mongodb+srv://youssefdrif1:dDrZdxQ519mc4zMM@togeathercluster.h2rtsua.mongodb.net/?retryWrites=true&w=majority&appName=TogeatherCluster', { useNewUrlParser: true, useUnifiedTopology: true });

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

updateUsers();