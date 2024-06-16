const mongoose = require('mongoose')
const validator = require('validator');
const bcrypt = require('bcrypt');
var uniqueValidator = require('mongoose-unique-validator')

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Veuillez rentrer votre nom']
    },
    firstname: {
        type: String,
        required: [true, 'Veuillez rentrer votre prénom']
    },
    email:{
        type: String,
        required: [true, 'Veuillez rentrer votre adresse mail'],
        unique: [true, 'Cette adresse mail est déjà associée à un compte'],
        validate: {
            validator: validator.isEmail,
            message: 'Veuillez rentrer une adresse mail valide'
        }
    },
    password:{
        type: String,
        required: [true, 'Veuillez rentrer un mot de passe'],
    },
});

UserSchema.plugin(uniqueValidator);

UserSchema.pre('save', function (next) {
    const user = this 
    bcrypt.hash(user.password, 10, (error, hash) => {
        user.password = hash
        next()
    })
})

const User = mongoose.model('User', UserSchema);

module.exports = User