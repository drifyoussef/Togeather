const paypal = require('paypal-rest-sdk');
const path = require('path');
const { paypalConfig } = require('../config/paypalConfig');

paypalConfig();

const createOrder = async (req, res) => {
    const { product, buyerId, sellerId } = req.body;
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
            return_url: `http://localhost:4000/successPayments?buyerId=${buyerId}&sellerId=${sellerId}`,
            cancel_url: `http://localhost:4000/cancelPayments`,
        },
    };

    paypal.payment.create(paymentData, (error, payment) => {
        if (error) {
            console.error('Error creating payment:', error);
            console.error('Validation error details:', error.response.details); // Log validation error details
            return res.status(500).json({ message: 'Error creating payment', error: error });
        }
        const approvalUrl = payment.links.find(link => link.rel === 'approval_url');
        console.log("Approval URL:", payment);
        if (approvalUrl) {
            const token = approvalUrl.href.split('token=')[1];
            return res.json({ token: token });
        } else {
            return res.status(500).json({ error: 'Approval URL not found' });
        }
    });
};

const successPayments = (req, res) => {
    const paymentId = req.query.paymentId;
    const payerId = { payer_id: req.query.PayerID };
    const sellerId = req.query.sellerId;
    console.log(req, "BONJOUR JE VEUX LE PAYERID");
    paypal.payment.execute(paymentId, payerId, (error, payment) => {
        if (error) {
            console.error('Error capturing payment:', error);
            return res.status(500).json({ message: 'Error capturing payment', error: error });
        }
        if (payment.state === 'approved') {
            distributePayments([{ amount: payment.transactions[0].amount.total, sellerPayPalId: sellerId }], res);
            res.json({ message: 'Payment successful and distributed' });
        } else {
            res.status(400).json({ status: 203, message: 'Payment not approved' });
        }
    });
};

const distributePayments = (payments, res) => {
    let errorMessage = '';
    payments.forEach(paymentDetail => {
        const sellerPayment = {
            amount: paymentDetail.amount,
            sellerPayPalId: paymentDetail.sellerPayPalId,
        };
        const payout = {
            sender_batch_header: {
                sender_batch_id: Math.random().toString(36).substring(9),
                email_subject: 'You have a payment!',
            },
            items: [{
                recipient_type: 'EMAIL',
                amount: {
                    value: parseFloat(sellerPayment.amount).toFixed(2),
                    currency: 'EUR',
                },
                receiver: sellerPayment.sellerPayPalId,
                note: 'Congratulations on your sale!',
                sender_item_id: 'item_1',
            }],
        };
        // Create payment for seller
        paypal.payout.create(payout, true, (error, payoutResponse) => {
            if (error) {
                errorMessage = error;
                return;
            }
        });
    });
    if (errorMessage) {
        return res.status(500).json({ message: 'Error distributing payment: ', error: errorMessage });
    }
};

module.exports = { createOrder, successPayments };