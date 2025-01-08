import { PayPalButtons } from "@paypal/react-paypal-js";
import React from "react";
import Swal from 'sweetalert2';

export default function PaypalPayment() {
  // Créer une commande PayPal
  const createOrder = async (data: any, actions: any) => {
    // Récupérer le token d'authentification
    const token = localStorage.getItem('token');
    const buyerId = "imredzcsgo@gmail.com"; // ID de l'acheteur
    const sellerId = "togeather@gmail.com"; // ID du vendeur

    try {
      // Créer une commande PayPal avec l'appel d'API
      const response = await fetch(`${process.env.REACT_APP_API_URL}/create-paypal-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // body contient les informations du produit et les ID de l'acheteur et du vendeur
        body: JSON.stringify({
          product: {
            description: "Togeather premium", // Description du produit
            cost: "2.99", // Prix du produit
          },
          buyerId: buyerId, // Inclure l'ID de l'acheteur dans le corps de la requête
          sellerId: sellerId, // Inclure l'ID du vendeur dans le corps de la requête
        }),
      });
      console.log(data, 'data from createOrder');
      console.log(actions, 'actions from createOrder');
      // Vérifier si la réponse est OK
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      // Extraire les données JSON
      const order = await response.json();
      console.log(order, 'order from createOrder');
      localStorage.setItem('paymentId', order.paymentId); // Récupérer le paymentId et le stocker dans le localStorage
      return order.token; // retourner le token de commande
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  };

  // Approuver la commande PayPal
  const onApprove = async (data: any, actions: any) => {
    try {
      console.log("onApprove data:", data); // Add logging
      const paymentId = localStorage.getItem('paymentId'); // Récupérer le paymentId du localStorage
      // Approuver la commande PayPal avec l'appel d'API
      const response = await fetch(`${process.env.REACT_APP_API_URL}/successPayments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentId: paymentId, // Utiliser le paymentId stocké dans le localStorage
          PayerID: data.payerID, // Utiliser le PayerID de l'objet data
          sellerId: "togeather@gmail.com", // ID du vendeur
        }),
      });
      // Vérifier si la réponse est OK
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      // Extraire les données JSON
      const result = await response.json();
      console.log(result, 'result from onApprove');
      // Afficher une alerte de paiement réussi
      Swal.fire({
        icon: 'success',
        title: 'Paiement réussi',
        text: 'Votre paiement a été effectué avec succès!',
      });
      // Afficher un message de succès
      return result;
    } catch (error) {
      // Gérer les erreurs de la commande PayPal
      console.error("Error capturing order:", error);
      // Afficher une alerte d'erreur de paiement
      Swal.fire({
        icon: 'error',
        title: 'Échec du paiement',
        text: 'Une erreur est survenue lors de la capture du paiement.',
      });
      throw error;
    }
  };
  
  return (
    <PayPalButtons
      createOrder={(data: any, actions: any) => createOrder(data, actions)}
      onApprove={(data: any, actions: any) => onApprove(data, actions)}
      onError={(err) => {
        console.error("PayPal Button Error:", err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur de paiement',
          text: 'Une erreur est survenue avec le bouton PayPal.',
        });
      }}
    />
  );
}