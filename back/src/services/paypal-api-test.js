const paypal = require('paypal-rest-sdk');
const dotenv = require('dotenv');
const { paypalConfig } = require('../config/paypalConfig');
dotenv.config();
const path = require('path');


const paypalPayement = (req, res) => {
    const { payments, buyerId } = req.body;
    if (!payments || payments.length === 0) {
        return res.status(400).json({ message: 'No payments provided' });
    }

    paypalConfig();

    // Total amount with site fees
    const totalAmount = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    const siteFee = (totalAmount * 0.05).toFixed(2);
    const totalAmountWithFee = (totalAmount + parseFloat(siteFee)).toFixed(2);

    const paymentData = {
        intent: 'sale',
        payer: {
            payment_method: 'paypal',
        },
        redirect_urls: {
            return_url: `http://localhost:4000/successPayments?buyerId=${buyerId}&payments=${encodeURIComponent(JSON.stringify(payments))}`,
            cancel_url: `http://localhost:4000/cancelPayments`,
        },
        transactions: [{
            amount: {
                total: totalAmountWithFee,
                currency: 'EUR',
            },
            description: 'Achat des produits choisis',
        }],
    };

    // Create the payment
    paypal.payment.create(paymentData, (error, payment) => {
        if (error) {
            console.error('Error creating payment:', error);
            return res.status(500).json({ message: 'Error creating payment', error: error });
        }
        // return the url for the payment in paypal
        const approvalUrl = payment.links.find(link => link.rel === 'approval_url');
        if (approvalUrl) {
            return res.json({ approvalUrl: approvalUrl.href });
        } else {
            return res.status(500).json({ error: 'Not found approval url' });
        }
    });
}

// cancel payment
const cancelPayments = (req, res) => {
    res.send('ol')
}

// Success payment and paid seller and the fees to site
const successPayments = (req, res) => {
    const paymentId = req.query.paymentId;
    const payerId = { payer_id: req.query.PayerID };

    const payments = JSON.parse(decodeURIComponent(req.query.payments));

    paypal.payment.execute(paymentId, payerId, (error, payment) => {
        if (error) {
            return res.status(500).json({ error: 'Error while executing payment', details: error.response });
        } else {
            if (payment.state === 'approved') {
                if (!Array.isArray(payments) || payments.length === 0) {
                    return res.status(400).json({ message: 'No valid payments to distribute' });
                }
                distributePayments(payments, res);
                // displays page html
                res.sendFile('sucess')
            } else {
                res.status(400).json({ status: 203, message: 'Paiement non approuvé' });
            }
        }
    });
}

// function paid seller and the fees to site
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
                email_subject: 'Tu as un paiement!',
            },
            items: [{
                recipient_type: 'EMAIL',
                amount: {
                    value: parseFloat(sellerPayment.amount).toFixed(2),
                    currency: 'EUR',
                },
                receiver: sellerPayment.sellerPayPalId,
                note: 'Félicitation pour votre vente!',
                sender_item_id: 'item_1',
            }],
        };

        // Pay the site fees
        const sitePayout = {
            sender_batch_header: {
                sender_batch_id: Math.random().toString(36).substring(9),
                email_subject: 'Site Fees Payment',
            },
            items: [{
                recipient_type: 'EMAIL',
                amount: {
                    value: (parseFloat(sellerPayment.amount) * 0.05).toFixed(2),
                    currency: 'EUR',
                },
                receiver: sitePayPalId,
                note: 'Frais de service',
                sender_item_id: 'service_fee',
            }],
        };

        // Create payment for seller
        paypal.payout.create(payout, true
                , (error, payoutResponse) => {
                if (error) {
                    errorMessage = error;
                   return;
                }
            }
        );

        // Create payment for site fees
        paypal.payout.create(sitePayout, true
                , (error, payoutResponse) => {
                if (error) {
                    errorMessage = error;
                    return;
                }
            }
        );
    });
    if (errorMessage) {
        return res.status(500).json({ message: 'Error distributing payment: ', error: errorMessage });
    }
    

}

module.exports = {
    paypalPayement, cancelPayments, successPayments
}
