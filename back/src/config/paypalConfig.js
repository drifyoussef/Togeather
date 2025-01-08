const paypal = require('paypal-rest-sdk');

// Configuration de l'API PayPal
const paypalConfig = () => {
    paypal.configure({
        mode: "sandbox", // sandbox (dev) or live (production)
        //id du client et clé secrete du client
        client_id: process.env.CLIENT_ID, 
        client_secret: process.env.APP_SECRET
    });
};

module.exports = { paypalConfig }