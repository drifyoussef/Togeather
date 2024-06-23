const User = require('../models/User')

module.exports = async (req, res, next) => {
    const userFind = await User.findById(req.session.userId)
    try {
        if (!userFind)
            return res.redirect('/')
    } catch (error) {
        console.log(`erreur sur authmiddleware => ${error}`);
    }
    next()
}