const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require("jsonwebtoken")
const path = require("path");
const appRoot = require('app-root-path');
const fs = require("fs");

module.exports = async (req, res) => {

    // Récupération des données du formulaire
    const { email, password } = req.body;
    console.log(req.body);

    try {
        console.log(email, "APPEL DE L'EMAIL");
        console.log(password, "APPEL DU MOT DE PASSE");
        // Recherche de l'utilisateur en base de données
        const userFind = await User.findOne({ email: email });

        if (userFind) {
            console.log('User found:', userFind); 
            console.log(userFind.isBanned, "USERFIND ISBANNED");

            if (
            userFind.isBanned &&
            userFind.banEnd &&
            new Date(userFind.banEnd) <= new Date()
            ) {
            userFind.isBanned = false;
            userFind.banReason = null;
            userFind.banEnd = null;
            await userFind.save();
            console.log(`User ${userFind.email} automatically unbanned at login.`);
            }

            // Vérification si l'utilisateur est banni
            if (userFind.isBanned) {
                const privateKey = fs.readFileSync(path.join(appRoot.path, "private.key"));
                const token = jwt.sign({ _id: userFind._id }, privateKey, { algorithm: 'RS256' });
                return res.status(403).json({
                    message: 'Vous êtes banni',
                    banReason: userFind.banReason,
                    banEnd: userFind.banEnd,
                    userId: userFind._id,
                    token: token // <-- ajoute le token ici
                });
            }


            // Vérification du mot de passe
            const same = await bcrypt.compare(password, userFind.password);

            // Vérification de l'email
            if(userFind.isEmailConfirmed === false){
                console.error('Email not confirmed');
                await userFind.resendConfirmationEmail();
                res.status(401).json({ message: 'Email non confirmé', emailNotConfirmed: true });
                return;
            }

            // Si le mot de passe est correct, on connecte l'utilisateur
            if (same) {    
                req.session.userId = userFind._id;
                console.log(req.session.userId, "ID DE L'UTILISATEUR LOGIN CONTROLLER REQ SESSION USERID");
                const privateKey = fs.readFileSync(path.join(appRoot.path, "private.key"));
                const token = jwt.sign({ _id: userFind._id }, privateKey, { algorithm: 'RS256' });
                res.status(200).json({ message: 'Connexion réussie',token:token, userId: userFind._id, firstname: userFind.firstname });
            } else {
                // Sinon, on renvoie une erreur 401
                console.error('Invalid password');
                res.status(401).json({ message: 'Email ou mot de passe invalide' });
            }
        } else {
            // Si l'utilisateur n'existe pas, on renvoie une erreur 401
            console.error('User not found');
            res.status(401).json({ message: 'Email ou mot de passe invalide' });
        }
    } catch (error) {
        // En cas d'erreur, on renvoie une erreur 500
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Erreur lors du login.' });
    }
};
