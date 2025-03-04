const jwt = require("jsonwebtoken");
const path = require("path");
const appRoot = require('app-root-path');
const fs = require("fs");

module.exports = async (req, res, next) => {
    //Recupérer le token qui sera dans le req.headers.Authorization 
    const token = req.headers.authorization;
    
	if(token) {
		//On enlève le Bearer
		const tokenWithoutBearer = token.replace("Bearer ", "");
		try {
            //Utiliser jwt pour decodér le token
            const privateKey = fs.readFileSync(path.join(appRoot.path, "private.key"));
			const decoded = jwt.verify(tokenWithoutBearer, privateKey);
            //On pourra utiliser token._id
			req.user = decoded;
            req.session.userId = decoded._id;
			next();
		}
		catch(err) {
            console.log("err", err)
			//Si le token n'est pas valide
			res.status(401).send('Unauthorized');
		}
	}
	else {
		//Si le token n'est pas présent
		res.status(401).send('Unauthorized');
	}
}