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

        // Gestion de l'unicité de l'email
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
            // Erreur d'unicité sur l'email
            return res.status(400).json({ message: "Cette adresse mail est déjà associée à un compte." });
        }

        // Cas 2 : erreur de validation Mongoose (ValidatorError sur unique)
        if (
        error.errors &&
        error.errors.email &&
        (error.errors.email.kind === "unique" || error.errors.email.type === "unique")
        ) {
        return res.status(400).json({ message: "Cette adresse mail est déjà associée à un compte." });
        }


       const validationErrors = Object.keys(error.errors || {}).map(key => error.errors[key].message)
        res.status(400).json({ message: validationErrors.join(', ') || "Erreur lors de l'inscription." });
        //req.session.validationErrors = validationErrors;
        res.redirect('/auth/register');
        console.log(`Create User error ${error}`);
    }
}