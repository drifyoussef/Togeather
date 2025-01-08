// On détruit la session et on redirige vers la page de connexion
module.exports = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/connection')
    })
}