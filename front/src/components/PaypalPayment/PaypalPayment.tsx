import { PayPalButtons } from "@paypal/react-paypal-js";
import React from "react";

export default function PaypalPayment() {
    
  const createOrder = async (data: any, actions: any) => {
    const token = localStorage.getItem('token');
    // Order is created on the server and the order id is returned
    return fetch(`${process.env.REACT_APP_API_URL}/my-server/create-paypal-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      // use the "body" param to optionally pass additional order information
      // like product skus and quantities
      body: JSON.stringify({
        product: {
          description: "Togeather premium",
          // ajouter une variable pour le prix par mois au lieu de une fois
          cost: "2.99",
        },
      }),
    })
      .then((response) => response.json())
      .then((order) => order.id);
  };
  
  const onApprove = async (data: any, actions: any) => {
    // Order is captured on the server and the response is returned to the browser
    const response = await fetch(`${process.env.REACT_APP_API_URL}/my-server/capture-paypal-order`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({
              orderID: data.orderID,
          }),
      });
      return await response.json();
    
  };

  return (
    <PayPalButtons
      createOrder={(data: any, actions: any) => createOrder(data, actions)}
      onApprove={(data: any, actions: any) => onApprove(data, actions)}
    />
  );
}
