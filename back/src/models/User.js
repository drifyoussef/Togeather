const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const uniqueValidator = require('mongoose-unique-validator');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const path = require('path');
const appRoot = require('app-root-path');
const fs = require('fs');
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'imredzcsgo@gmail.com',
    pass: 'qkmz yzja vagx vemu',
  },
});

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  imageUrl: { type: String, required: false },
  name: { type: String, required: [true, 'Veuillez rentrer votre nom'] },
  firstname: { type: String, required: [true, 'Veuillez rentrer votre prénom'] },
  email: {
    type: String,
    required: [true, 'Veuillez rentrer votre adresse mail'],
    unique: [true, 'Cette adresse mail est déjà associée à un compte'],
    validate: { validator: validator.isEmail, message: 'Veuillez rentrer une adresse mail valide' }
  },
  isEmailConfirmed: { type: Boolean, default: false },
  emailConfirmationId: { type: String, required: false },
  age: { type: Number, required: [true, 'Veuillez indiquer votre age'] },
  password: { type: String, required: [true, 'Veuillez rentrer un mot de passe'] },
  job: { type: String },
  passions: { type: [String], required: false },
  userGender: { type: String, required: [true, 'Veuillez indiquer votre genre'] },
  preferredGender: { type: String, required: [true, 'Veuillez indiquer le genre que vous recherchez'] },
  favoriteCategory: { type: String, required: [true, 'Veuillez indiquer votre catégorie préférée'] },
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

// Configuration de l'algorithme de chiffrement et de la clé secrète
const algorithm = 'aes-256-cbc';
const secretKey = Buffer.from(process.env.SECRET_KEY, 'hex');

// Fonction pour chiffrer le html dans le mail de confirmation
const encrypt = (text) => {
  const iv = crypto.randomBytes(16); // Générer un nouvel IV
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  const hmac = crypto.createHmac('sha256', secretKey)
    .update(iv.toString('hex') + encrypted.toString('hex'))
    .digest('hex');
  return {
    iv: iv.toString('hex'),
    content: encrypted.toString('hex'),
    hmac
  };
};

UserSchema.methods.resendConfirmationEmail = async function () {
  try {
    console.log(`Attempting to send confirmation email to ${this.email}`);
    const encryptedData = encrypt(this.email);
    const emailConfirmationId = `${encryptedData.iv}:${encryptedData.content}`;
    console.log(`Generated emailConfirmationId: ${emailConfirmationId}`);
    this.emailConfirmationId = emailConfirmationId;
    await this.save();
    console.log('Saved user with emailConfirmationId');

    const encryptedToken = Buffer.from(emailConfirmationId).toString('base64');
    console.log(`Encrypted token: ${encryptedToken}`);

    const confirmationLink = `${process.env.ORIGIN}/confirm-email?token=${encodeURIComponent(encryptedToken)}`;
    console.log('Confirmation Link:', confirmationLink);
    
    await transporter.sendMail({
      from: 'imredzcsgo@gmail.com',
      to: this.email,
      subject: 'Veuillez confirmer votre adresse mail',
      html: `<p>Cliquez sur ce <a href="${confirmationLink}">lien</a> pour confirmer votre adresse mail.</p>`
    });
    console.log(`Mail de confirmation envoyé à ${this.email}`);
  } catch (error) {
    console.error('Erreur lors de l\'envoi du mail:', error);
  }
};

// Add a method to decrypt and compare the token
UserSchema.methods.compareToken = function (token) {
  try {
    const decryptedToken = Buffer.from(decodeURIComponent(token), 'base64').toString('ascii');
    console.log('Decrypted token:', decryptedToken);
    return this.emailConfirmationId === decryptedToken;
  } catch (error) {
    console.error('Error comparing token:', error);
    return false;
  }
};

const User = mongoose.model('User', UserSchema);

module.exports = User;