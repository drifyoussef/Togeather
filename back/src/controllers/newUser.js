module.exports = (req, res) => {
    var name = ""
    var firstname = ""
    var email = ""
    var password = ""
    const data = req.flash('data')[0];
    if (typeof data != "undefined") {
        name = data.name,
        firstname = data.firstname,
        email = data.email,
        password = data.password
    }
    res.redirect('/auth/register', {
        errors: req.flash('validationErrors'),
        name: name,
        firstname: firstname,
        email: email,
        password: password
    })
}