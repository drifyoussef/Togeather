// Formulaire d'inscription
module.exports = (req, res) => {
    var imageUrl = ""
    var name = ""
    var firstname = ""
    var email = ""
    var age = ""
    var password = ""
    const data = req.flash('data')[0];
    // Si des données ont été soumises, on les récupère
    if (typeof data != "undefined") {
        imageUrl = data.imageUrl,
        name = data.name,
        firstname = data.firstname,
        email = data.email,
        age = data.age,
        password = data.password
    }
    // On renvoie le formulaire d'inscription avec les données éventuellement soumises
    res.redirect('/auth/register', {
        errors: req.flash('validationErrors'),
        imageUrl: imageUrl,
        name: name,
        firstname: firstname,
        email: email,
        age: age,
        password: password
    })
}