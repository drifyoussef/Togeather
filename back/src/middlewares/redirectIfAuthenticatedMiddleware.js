module.exports = (req, res, next) => {
    console.log("Session userId:", req.session.userId);
    next();
}