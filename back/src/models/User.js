const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
var uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  imageUrl: {
    type: String,
    required: [false],
  },
  name: {
    type: String,
    required: [true, 'Veuillez rentrer votre nom']
  },
  firstname: {
    type: String,
    required: [true, 'Veuillez rentrer votre prénom']
  },
  email: {
    type: String,
    required: [true, 'Veuillez rentrer votre adresse mail'],
    unique: [true, 'Cette adresse mail est déjà associée à un compte'],
    validate: {
      validator: validator.isEmail,
      message: 'Veuillez rentrer une adresse mail valide'
    }
  },
  age: {
    type: Number,
    required: [true, 'Veuillez indiquer votre age'],
  },
  password: {
    type: String,
    required: [true, 'Veuillez rentrer un mot de passe'],
  },
  job: {
    type: String,
  },
  passions: {
    type: [String],
    required: [false],
  },
  userGender: {
    type: String,
    required: [true, 'Veuillez indiquer votre genre'],
  },
  preferredGender: {
    type: String,
    required: [true, 'Veuillez indiquer le genre que vous recherchez'],
  },
  favoriteCategory: {
    type: String,
    required: [true, 'Veuillez indiquer votre catégorie préférée'],
  },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isMutual: { type: Boolean, default: false },
  previews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Preview' }],
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
});

UserSchema.plugin(uniqueValidator);

UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
