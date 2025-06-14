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

// Configuration du service d'envoi de mail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'imredzcsgo@gmail.com',
    pass: 'qkmz yzja vagx vemu',
  },
});

const Schema = mongoose.Schema;

// Création du schéma User avec les champs nécessaires
const UserSchema = new Schema({
  imageUrl: { type: String, required: false }, // Ajout de l'image de profil
  name: { type: String, required: [true, 'Veuillez rentrer votre nom'] }, // Ajout du nom
  firstname: { type: String, required: [true, 'Veuillez rentrer votre prénom'] }, // Ajout du prénom
  email: {
    type: String,
    required: [true, 'Veuillez rentrer votre adresse mail'],
    unique: [true, 'Cette adresse mail est déjà associée à un compte'],
    validate: { validator: validator.isEmail, message: 'Veuillez rentrer une adresse mail valide' }
  }, // Ajout de l'email
  isEmailConfirmed: { type: Boolean, default: false }, // Booléen pour savoir si l'email a été confirmé ou non par l'utilisateur
  emailConfirmationId: { type: String, required: false }, // Identifiant de confirmation de l'email de l'utilisateur
  age: { type: Number, required: [true, 'Veuillez indiquer votre age'] }, // Age de l'utilisateur
  password: { type: String, required: [true, 'Veuillez rentrer un mot de passe'] }, // Mot de passe de l'utilisateur
  job: { type: String }, // Métier de l'utilisateur
  passions: { type: [String], required: false }, // Passions de l'utilisateur
  userGender: { type: String, required: [true, 'Veuillez indiquer votre genre'] }, // Genre de l'utilisateur
  preferredGender: { type: String, required: [true, 'Veuillez indiquer le genre que vous recherchez'] }, // Genre que l'on souhaite voir
  favoriteCategory: { type: String, required: [true, 'Veuillez indiquer votre catégorie préférée'] }, // Catégorie préférée
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // like d'autres utilisateurs
  isMutual: { type: Boolean, default: false }, // like mutuel
  previews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Preview' }],
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }], // Messages des utilisateurs
  isAdmin: { type: Boolean, default: false }, // Booléen pour savoir si l'utilisateur est un administrateur
  isBanned: { type: Boolean, default: false }, // Booléen pour savoir si l'utilisateur est banni
  banReason: { type: String, required: false, default: null }, // Raison du bannissement
  banEnd: { type: Date, required: false, default: null }, // Date de fin du bannissement
});

UserSchema.plugin(uniqueValidator);

// Hash du mot de passe avant de le sauvegarder
UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Configuration de l'algorithme de chiffrement et de la clé secrète
const algorithm = 'aes-256-cbc';
console.log('SECRET_KEY:', process.env.SECRET_KEY);
if (!process.env.SECRET_KEY) {
  throw new Error('SECRET_KEY is not defined in environment variables');
}
const secretKey = Buffer.from(process.env.SECRET_KEY, 'hex');

// Fonction pour chiffrer le html dans le mail de confirmation
const encrypt = (text) => {
  const iv = crypto.randomBytes(16); // Générer un nouvel IV
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv); // Créer un chiffreur avec l'algorithme et la clé secrète
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]); // Chiffrer le texte
  const hmac = crypto.createHmac('sha256', secretKey) // Créer un HMAC avec la clé secrète
    .update(iv.toString('hex') + encrypted.toString('hex')) // Mettre à jour le HMAC avec l'IV et le texte chiffré
    .digest('hex'); // Récupérer le HMAC en hexadécimal
    // Retourner l'IV, le texte chiffré et le HMAC
  return {
    iv: iv.toString('hex'),
    content: encrypted.toString('hex'),
    hmac
  };
};

// Envoi d'un mail de confirmation de l'email
UserSchema.methods.resendConfirmationEmail = async function () {
  try {
    console.log(`Attempting to send confirmation email to ${this.email}`);
    // Chiffrer l'email de l'utilisateur
    const encryptedData = encrypt(this.email);
    // Générer l'identifiant de confirmation de l'email
    const emailConfirmationId = `${encryptedData.iv}:${encryptedData.content}`;
    console.log(`Generated emailConfirmationId: ${emailConfirmationId}`);
    // Sauvegarder l'identifiant de confirmation de l'email
    this.emailConfirmationId = emailConfirmationId;
    await this.save();
    console.log('Saved user with emailConfirmationId');

    // Créer un token JWT avec l'identifiant de confirmation de l'email
    const encryptedToken = Buffer.from(emailConfirmationId).toString('base64');
    console.log(`Encrypted token: ${encryptedToken}`);

    // Créer le lien de confirmation de l'email
    const confirmationLink = `${process.env.ORIGIN}/confirm-email?token=${encodeURIComponent(encryptedToken)}`;
    console.log('Confirmation Link:', confirmationLink);
    
    // Envoyer le mail de confirmation
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

// Comparaison du token de confirmation de l'email
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