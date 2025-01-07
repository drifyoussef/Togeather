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
            return_url: `${process.env.REACT_APP_API_URL}/successPayments?buyerId=${buyerId}&sellerId=${sellerId}`,
            cancel_url: `${process.env.REACT_APP_API_URL}/cancelPayments`,
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
            console.log("Generated paymentId:", payment.id); // Log the generated paymentId
            return res.json({ token: token, paymentId: payment.id }); // Include paymentId in the response
        } else {
            return res.status(500).json({ error: 'Approval URL not found' });
        }
    });
};

const successPayments = async (req, res) => {
    const { paymentId, PayerID, sellerId } = req.body;

    if (!paymentId || !PayerID || !sellerId) {
        return res.status(400).json({ message: 'Missing paymentId, PayerID, or sellerId' });
    }

    console.log('Executing Payment with:', { paymentId, PayerID, sellerId });

    paypal.payment.execute(paymentId, { payer_id: PayerID }, async (error, payment) => {
        if (error) {
            console.error('Error capturing payment:', error.response || error);
            return res.status(500).json({ message: 'Error capturing payment', error });
        }

        console.log('Payment Response:', payment);

        if (payment.state === 'approved') {
            try {
                await distributePayments(
                    [{ amount: payment.transactions[0].amount.total, sellerPayPalId: sellerId }],
                    res
                );
            } catch (distributionError) {
                console.error('Error distributing payments:', distributionError);
                return res.status(500).json({ message: 'Error distributing payments', error: distributionError });
            }
        } else {
            return res.status(400).json({ message: 'Payment not approved', status: 203 });
        }
    });
};

const distributePayments = async (payments, res) => {
    try {
        const payoutPromises = payments.map(paymentDetail => {
            const payout = {
                sender_batch_header: {
                    sender_batch_id: Math.random().toString(36).substring(9),
                    email_subject: 'You have a payment!',
                },
                items: [{
                    recipient_type: 'EMAIL',
                    amount: {
                        value: parseFloat(paymentDetail.amount).toFixed(2),
                        currency: 'EUR',
                    },
                    receiver: paymentDetail.sellerPayPalId,
                    note: 'Congratulations on your sale!',
                    sender_item_id: 'item_1',
                }],
            };

            return new Promise((resolve, reject) => {
                paypal.payout.create(payout, true, (error, payoutResponse) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(payoutResponse);
                });
            });
        });

        const results = await Promise.all(payoutPromises);
        console.log('Payout results:', results);
        return res.json({ message: 'Payments distributed successfully', results });
    } catch (error) {
        console.error('Error distributing payments:', error);
        return res.status(500).json({ message: 'Error distributing payments', error });
    }
};

module.exports = { createOrder, successPayments };