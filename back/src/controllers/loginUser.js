const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require("jsonwebtoken")
const path = require("path");
const appRoot = require('app-root-path');
const fs = require("fs")

module.exports = async (req, res) => {
    const { email, password } = req.body;
    console.log(req.body);

    try {
        const userFind = await User.findOne({ email: email });

        if (userFind) {
            console.log('User found:', userFind); 
            const same = await bcrypt.compare(password, userFind.password);

            if (same) {
                req.session.userId = userFind._id;
                const privateKey = fs.readFileSync(path.join(appRoot.path, "private.key"));
                const token = jwt.sign({ _id: userFind._id }, privateKey, { algorithm: 'RS256' });
                res.status(200).json({ message: 'Connexion réussie',token:token });
            } else {
                console.error('Invalid password');
                res.status(401).json({ message: 'Email ou mot de passe invalide' });
            }
        } else {
            console.error('User not found');
            res.status(401).json({ message: 'Email ou mot de passe invalide' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Erreur lors du login.' });
    }
};
