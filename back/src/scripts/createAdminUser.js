// filepath: /c:/Users/youss/Desktop/Togeather/back/scripts/createAdminUser.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

// Connect to MongoDB
mongoose.connect('mongodb+srv://youssefdrif1:dDrZdxQ519mc4zMM@togeathercluster.h2rtsua.mongodb.net/?retryWrites=true&w=majority&appName=TogeatherCluster');

const createAdminUser = async () => {
  try {
    const email = 'togeathercontact@gmail.com';
    const password = process.env.PASSWORD_ADMIN;
    const hashedPassword = await bcrypt.hash(password, 10);

    const adminUser = new Admin({
      email: email,
      password: hashedPassword,
      isAdmin: true,
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error creating admin user:', error);
    mongoose.connection.close();
  }
};

createAdminUser();