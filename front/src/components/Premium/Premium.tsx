import React from "react";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import PaypalPayment from "../PaypalPayment/PaypalPayment";
import "./Premium.css";


export default function Premium() {

  const initialOptions = {
    clientId: "AaPgqVFDb-rCqMTXaqGIrs_eX06bN_c6MpKe4QB6qc-5rU1Q7OXi6m5-UOuOV04TMH5d2oTIYBA-YJks",
    currency: "EUR",
    intent: "capture",
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
    <div className="premium-container">
      <div className="premium-card">
        <div className="premium-header">
          <h1>Souscrire au premium pour 2€99/mois</h1>
          <p>Avec le premium vous aurez accès:</p>
        </div>
        <ul className="premium-features">
          <li>Likes illimités</li>
        </ul>
        <button className="upgrade-button">Souscrire dès maintenant</button>
        <PaypalPayment />
      </div>
    </div>
    </PayPalScriptProvider>
  );
}
