module.exports = (req, res, next) => {
    // Si l'utilisateur est connecté, on le redirige vers la page d'accueil
    if (req.session.userId) {
        return res.redirect('/')
    }
    next()
}