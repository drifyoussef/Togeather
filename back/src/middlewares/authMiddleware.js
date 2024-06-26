const User = require('../models/User');
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");

module.exports = async (req, res, next) => {
    //Recupérer le token qui sera dans le req.headers.Authorization (faudra enlever Bearer)
    const token = req.headers.authorization;
    
	if(token) {
		const tokenWithoutBearer = token.replace("Bearer ", "");
		try {
            //Utiliser jwt pour decordér le token
            const privateKey = fs.readFileSync(path.join(process.cwd(), "private.key"));
			const decoded = jwt.verify(tokenWithoutBearer, privateKey);
            //On pourra utiliser token._id
			req.user = decoded;
            req.session.userId = decoded._id;
			next();
		}
		catch(err) {
            console.log("err", err)
			res.status(401).send('Unauthorized');
		}
	}
	else {
		res.status(401).send('Unauthorized');
	}
}