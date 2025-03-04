// filepath: /c:/Users/youss/Desktop/Togeather/back/src/models/Admin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const adminSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: { validator: validator.isEmail, message: 'Veuillez rentrer une adresse mail valide' }
  },
  password: {
    type: String,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: true
  }
});

adminSchema.plugin(uniqueValidator);

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;