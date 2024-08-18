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
    age: {
        type: Number,
        required: [true, 'Veuillez indiquer votre age'],
    },
    password:{
        type: String,
        required: [true, 'Veuillez rentrer un mot de passe'],
    },
    job:{
        type: String,
    },
    passions:{
        type: [String],
        required: [false],
    },
    userGender:{
        type: String,
        required: [true],
    },
    preferredGender:{
        type: String,
        required: [true],
    },
    favoriteCategory:{
        type: String,
        required: [true],
    },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
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