const bcrypt = require('bcrypt');
const User = require('../models/User');

module.exports = async (req, res) => {
    const { email, password } = req.body;
    const userFind = await User.findOne({ email: email });
    if (userFind) {
        const same = await bcrypt.compare(password, userFind.password);
        if (same) {
            res.status(200).json({ message: 'Login successful' });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};
