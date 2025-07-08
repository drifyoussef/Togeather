import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import PaypalPayment from "../PaypalPayment/PaypalPayment";
import "./Premium.css";

export default function Premium() {
  const [isPremium, setIsPremium] = useState(false);

  const connectedUserId = localStorage.getItem("currentUserId");

  // Initialiser les options PayPal
  const initialOptions = {
    clientId:
      "AaPgqVFDb-rCqMTXaqGIrs_eX06bN_c6MpKe4QB6qc-5rU1Q7OXi6m5-UOuOV04TMH5d2oTIYBA-YJks",
    currency: "EUR",
    intent: "capture",
  };

  // Gérer l'état premium
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${process.env.REACT_APP_API_URL}/auth/user`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setIsPremium(!!data.isPremium);
      })
      .catch((error) => console.error("Error fetching user data:", error));
  }, []);

  //Fonction pour gérer la desincription du premium
  const handleUnsubscribe = () => {
    Swal.fire({
      title: "Êtes-vous sûr de vouloir vous désinscrire du premium ?",
      text: "Vous perdrez l'accès aux fonctionnalités premium.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, me désinscrire",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed) {
        handleUnsubscribeConfirmed();
      }
    });
  };

  // Fonction pour accepter la désinscription du premium
  const handleUnsubscribeConfirmed = () => {
    try {
      fetch(`${process.env.REACT_APP_API_URL}/auth/unsubscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            Swal.fire({
              title: "Erreur",
              text: "Une erreur s'est produite lors de la désinscription du premium.",
              icon: "error",
            });
          }
          return response.json();
        })
        .then(() => {
          setIsPremium(false);
          Swal.fire({
            title: "Succès",
            text: "Vous avez été désinscrit du premium.",
            icon: "success",
          });
        })
        .catch((error) => {
          console.error("Error unsubscribing from premium:", error);
          Swal.fire({
            title: "Erreur",
            text: "Une erreur s'est produite lors de la désinscription du premium.",
            icon: "error",
          });
        });
    } catch (error) {
      console.error("Error unsubscribing from premium:", error);
      Swal.fire({
        title: "Erreur",
        text: "Une erreur s'est produite lors de la désinscription du premium.",
        icon: "error",
      });
    }
  };

  if (isPremium && connectedUserId) {
    return (
      <div className="premium-container">
        <div className="premium-card">
          <h1>Vous êtes déjà premium !</h1>
          <p>Merci de soutenir notre site web.</p>
          <button onClick={handleUnsubscribe}>Se désinscrire</button>
        </div>
      </div>
    );
  }

  return (
    <PayPalScriptProvider options={initialOptions}>
      <div className="premium-container">
        <div className="premium-card">
          <div className="premium-header">
            <h1>Souscrire au premium pour 2€99</h1>
            <p>Avec le premium vous aurez accès:</p>
          </div>
          <ul className="premium-features">
            <li>Likes illimités</li>
          </ul>
          <button className="upgrade-button">Souscrire dès maintenant</button>
          <PaypalPayment onSuccess={() => setIsPremium(true)} />
        </div>
      </div>
    </PayPalScriptProvider>
  );
}
