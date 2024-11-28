const paypal = require('paypal-rest-sdk');
const { paypalConfig } = require('../config/paypalConfig');

paypalConfig();

const createOrder = async (req, res) => {
    const { product } = req.body;
    console.log("Received request:", req.body);
    if (!product) {
        return res.status(400).json({ message: 'Product details are required' });
    }

    const paymentData = {
        intent: 'sale',
        payer: {
            payment_method: 'paypal',
        },
        transactions: [{
            amount: {
                total: product.cost,
                currency: 'EUR',
            },
            description: product.description,
        }],
        redirect_urls: {
            return_url: `http://localhost:4000/service/successPayments`, // Hardcoded URL for testing
            cancel_url: `http://localhost:4000/api/service/cancelPayments`, // Hardcoded URL for testing
        },
    };

    paypal.payment.create(paymentData, (error, payment) => {
        if (error) {
            console.error('Error creating payment:', error);
            return res.status(500).json({ message: 'Error creating payment', error: error });
        }
        const approvalUrl = payment.links.find(link => link.rel === 'approval_url');
        if (approvalUrl) {
            return res.json({ id: payment.id, approvalUrl: approvalUrl.href });
        } else {
            return res.status(500).json({ error: 'Approval URL not found' });
        }
    });
};

module.exports = { createOrder };