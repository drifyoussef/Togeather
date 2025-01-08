const paypal = require('paypal-rest-sdk');
const path = require('path');
const { paypalConfig } = require('../config/paypalConfig');

paypalConfig();

// Création de la commande
const createOrder = async (req, res) => {
    // Récupération des données de la requête (produit, acheteur, vendeur)
    const { product, buyerId, sellerId } = req.body;
    console.log("Received request:", req.body);
    // Vérification de la présence des données du produit
    if (!product) {
        return res.status(400).json({ message: 'Product details are required' });
    }

    // Création de l'objet de paiement
    const paymentData = {
        // Type de transaction
        intent: 'sale',
        // Méthode de paiement
        payer: {
            payment_method: 'paypal',
        },
        // Détails de la transaction
        transactions: [{
            amount: {
                total: product.cost,
                currency: 'EUR',
            },
            // Description de la transaction
            description: product.description,
        }],
        // Redirections en cas de succès ou d'annulation
        redirect_urls: {
            return_url: `${process.env.ORIGIN}/successPayments?buyerId=${buyerId}&sellerId=${sellerId}`,
            cancel_url: `${process.env.ORIGIN}/cancelPayments`,
        },
    };

    // Création de la transaction
    paypal.payment.create(paymentData, (error, payment) => {
        if (error) {
            console.error('Error creating payment:', error);
            console.error('Validation error details:', error.response.details); // Log validation error details
            // En cas d'erreur, on renvoie une erreur 500
            return res.status(500).json({ message: 'Error creating payment', error: error });
        }
        // Récupération de l'URL de validation
        const approvalUrl = payment.links.find(link => link.rel === 'approval_url');
        console.log("Approval URL:", payment);
        // Si l'URL de validation est trouvée, on renvoie l'URL et l'ID de paiement
        if (approvalUrl) {
            const token = approvalUrl.href.split('token=')[1];
            console.log("Generated paymentId:", payment.id); // Log the generated paymentId
            // On renvoie le token et l'ID de paiement
            return res.json({ token: token, paymentId: payment.id }); // Include paymentId in the response
        } else {
            // En cas d'erreur, on renvoie une erreur 500
            return res.status(500).json({ error: 'Approval URL not found' });
        }
    });
};

// Succès de la transaction
const successPayments = async (req, res) => {
    // Récupération des données de la requête (ID de paiement, ID du payeur, ID du vendeur)
    const { paymentId, PayerID, sellerId } = req.body;

    // Vérification de la présence des données de paiement
    if (!paymentId || !PayerID || !sellerId) {
        return res.status(400).json({ message: 'Missing paymentId, PayerID, or sellerId' });
    }

    console.log('Executing Payment with:', { paymentId, PayerID, sellerId });

    // Exécution du paiement avec l'ID de paiement et l'ID du payeur
    paypal.payment.execute(paymentId, { payer_id: PayerID }, async (error, payment) => {
        if (error) {
            console.error('Error capturing payment:', error.response || error);
            // En cas d'erreur, on renvoie une erreur 500
            return res.status(500).json({ message: 'Error capturing payment', error });
        }

        console.log('Payment Response:', payment);

        // Si le paiement est approuvé, on distribue les paiements
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

// Distribution des paiements
const distributePayments = async (payments, res) => {
    try {
        // Création des promesses de paiement
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

            // Création de la promesse de paiement
            return new Promise((resolve, reject) => {
                paypal.payout.create(payout, true, (error, payoutResponse) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(payoutResponse);
                });
            });
        });

        // Résolution de toutes les promesses de paiement
        const results = await Promise.all(payoutPromises);
        console.log('Payout results:', results);
        return res.json({ message: 'Payments distributed successfully', results });
    } catch (error) {
        // En cas d'erreur, on renvoie une erreur 500
        console.error('Error distributing payments:', error);
        return res.status(500).json({ message: 'Error distributing payments', error });
    }
};

module.exports = { createOrder, successPayments };