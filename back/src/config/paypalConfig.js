const paypal = require('paypal-rest-sdk');

const paypalConfig = () => {
    paypal.configure({
        mode: "sandbox", // sandbox (dev) or live (production)
        client_id: process.env.CLIENT_ID, 
        client_secret: process.env.APP_SECRET
    });
};

module.exports = { paypalConfig }