const User = require('../models/User')

module.exports = async (req, res) => {
    try {
        // Création de l'utilisateur
        const user = await User.create(req.body)
        console.log(`success User created ${user}`);
        // Redirection vers la page home
        res.redirect('/')
    } catch (error) {
        console.log(JSON.stringify(error));
        const validationErrors = Object.keys(error.errors).map(key => error.errors[key].message)
        //req.flash.valdationErrors = validationErrors
        req.flash('validationErrors', validationErrors)
        //req.session.validationErrors = validationErrors;
        res.redirect('/auth/register');
        console.log(`Create User error ${error}`);
    }

}