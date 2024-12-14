const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
var uniqueValidator = require('mongoose-unique-validator');
const { Resend } = require('resend');


const resend = new Resend(`${process.env.RESEND_API_KEY}`);

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
    await resend.emails.send({
      from: 'imredzcsgo@gmail.com',
      to: this.email,
      subject: 'Please confirm your email address',
      html: `<p>Click <a href="https://localhost:300/confirm-email?token=${this._id}">here</a> to confirm your email address.</p>`,
    });
    console.log(`Confirmation email sent to ${this.email}`);
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
