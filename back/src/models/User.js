const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
var uniqueValidator = require('mongoose-unique-validator');
const nodemailer = require("nodemailer");
const jwt = require('jsonwebtoken');
const path = require("path");
const appRoot = require('app-root-path');
const fs = require("fs");
const { v4: uuidv4 } = require('uuid');


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "imredzcsgo@gmail.com",
    pass: "xwcv kmnu cwzz bbiv",
  },
});

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
  isEmailConfirmed: {
    type: Boolean,
    default: false,
  },
  emailConfirmationId: {
    type: String,
    default: uuidv4,
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

UserSchema.methods.resendConfirmationEmail = async function () {
  try {
    console.log(`Attempting to send confirmation email to ${this.email}`);
    const emailConfirmationId = uuidv4();
    this.emailConfirmationId = emailConfirmationId;
    await this.save();
    await transporter.sendMail({
      from: 'imredzcsgo@gmail.com',
      to: this.email,
      subject: 'Veuillez confirmer votre adresse mail',
      html: `<p>Cliquez sur ce <a href="https://localhost:3000/confirm-email?id=${emailConfirmationId}">lien</a> pour confirmer votre adresse mail.</p>`,
    });
    console.log(`Mail de confirmation envoyé à ${this.email}`);
  } catch (error) {
    console.error('Erreur lors de l\'envoi du mail:', error);
  }
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
