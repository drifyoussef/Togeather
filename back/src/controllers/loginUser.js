const bcrypt = require('bcrypt');
const User = require('../models/User');

module.exports = async (req, res) => {
    const { email, password } = req.body;
    const userFind = await User.findOne({ email: email });
    if (userFind) {
        const same = await bcrypt.compare(password, userFind.password);
        if (same) {
            req.session.userId = userFind._id
            console.dir(req.session);
            res.status(200).json({ message: 'Connexion réussie' });
        } else {
            res.status(401).json({ message: 'Email ou mot de passe invalide' });
        }
    } else {
        res.status(401).json({ message: 'Email ou mot de passe invalide' });
    }
};
