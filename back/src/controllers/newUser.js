module.exports = (req, res) => {
    var name = ""
    var firstname = ""
    var email = ""
    var age = ""
    var password = ""
    const data = req.flash('data')[0];
    if (typeof data != "undefined") {
        name = data.name,
        firstname = data.firstname,
        email = data.email,
        age = data.age,
        password = data.password
    }
    res.redirect('/auth/register', {
        errors: req.flash('validationErrors'),
        name: name,
        firstname: firstname,
        email: email,
        age: age,
        password: password
    })
}