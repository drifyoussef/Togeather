const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const path = require('path');
const appRoot = require('app-root-path');
const fs = require('fs');

module.exports = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userFind = await Admin.findOne({ email: email });

    if (userFind && userFind.isAdmin) {
      const same = await bcrypt.compare(password, userFind.password);

      if (same) {
        req.session.userId = userFind._id;
        const privateKey = fs.readFileSync(path.join(appRoot.path, 'private.key'));
        const token = jwt.sign({ _id: userFind._id, isAdmin: userFind.isAdmin }, privateKey, { algorithm: 'RS256', expiresIn: '1h' });
        console.log('Generated token admin login:', token);
        res.status(200).json({ message: 'Connexion réussie', token: token, userId: userFind._id, firstname: userFind.firstname, isAdmin: userFind.isAdmin });
      } else {
        res.status(401).json({ message: 'Email ou mot de passe invalide' });
      }
    } else {
      res.status(401).json({ message: 'Email ou mot de passe invalide' });
    }
  } catch (error) {
    console.error('Error during login loginAdmin controller:', error);
    res.status(500).json({ message: 'Erreur lors du login.' });
  }
};