module.exports = (req, res, next) => {
    // Si l'utilisateur est connecté, on le redirige vers la page d'accueil
    console.log("Session userId:", req.session.userId);
    if (req.session.userId) {
  // Génère le token ici si besoin
  const privateKey = fs.readFileSync(
    path.join(appRoot.path, "private.key")
  );
  const token = jwt.sign({ _id: req.session.userId }, privateKey, {
    algorithm: "RS256",
  });
  return res.status(200).json({ alreadyLoggedIn: true, token: token });
}
    next()
}