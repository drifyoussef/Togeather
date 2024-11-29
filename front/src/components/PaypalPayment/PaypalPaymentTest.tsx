import React, { useState } from "react";

const PaypalPayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateOrder = async () => {
    setLoading(true);
    setError(null);

    const product = {
      description: "Produit d'exemple",
      cost: "50.00",
    };
    const buyerId = "acheteur@email.com"; // ID de l'acheteur
    const sellerId = "vendeur@email.com"; // ID du vendeur

    try {
      // Appel au backend pour créer une commande
      const response = await fetch(`${process.env.REACT_APP_API_URL}/paypalPayement`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ product, buyerId, sellerId }),
      });

      if (!response.ok) {
        throw new Error(`Erreur serveur : ${response.statusText}`);
      }

      const data = await response.json();

      if (data.token) {
        // Redirige l'utilisateur vers PayPal avec le token
        window.location.href = `https://www.sandbox.paypal.com/checkoutnow?token=${data.token}`;
      } else {
        throw new Error("Erreur : Le token est manquant.");
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création de la commande.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="paypal-container">
      <h2 className="paypal-title">Paiement avec PayPal</h2>
      {loading && <p className="loading-text">Chargement en cours...</p>}
      {error && <p className="error-text">{error}</p>}

      <button className="create-order-btn" onClick={handleCreateOrder} disabled={loading}>
        Payer maintenant avec PayPal
      </button>
    </div>
  );
};

export default PaypalPayment;
