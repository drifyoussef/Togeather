import { PayPalButtons } from "@paypal/react-paypal-js";
import React from "react";

export default function PaypalPayment() {
  const createOrder = async (data: any, actions: any) => {
    const token = localStorage.getItem('token');
    const buyerId = "imredzcsgo@gmail.com";
    const sellerId = "togeather@gmail.com"; // Include sellerId here

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/create-paypal-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product: {
            description: "Togeather premium",
            cost: "2.99",
          },
          buyerId: buyerId,
          sellerId: sellerId, // Include sellerId in the request body
        }),
      });
      console.log(data, 'data from createOrder');
      console.log(actions, 'actions from createOrder');
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const order = await response.json();
      console.log(order, 'order from createOrder');
      localStorage.setItem('paymentId', order.paymentId); // Store paymentId in localStorage
      return order.token; // Return the EC-XXX token
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  };

  const onApprove = async (data: any, actions: any) => {
    try {
      console.log("onApprove data:", data); // Add logging
      const paymentId = localStorage.getItem('paymentId'); // Retrieve paymentId from localStorage
      const response = await fetch(`${process.env.REACT_APP_API_URL}/successPayments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentId: paymentId, // Use the stored paymentId
          PayerID: data.payerID,
          sellerId: "togeather@gmail.com", // Include sellerId in the request body
        }),
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const result = await response.json();
      console.log(result, 'result from onApprove');
      return result;
    } catch (error) {
      console.error("Error capturing order:", error);
      throw error;
    }
  };
  
  return (
    <PayPalButtons
      createOrder={(data: any, actions: any) => createOrder(data, actions)}
      onApprove={(data: any, actions: any) => onApprove(data, actions)}
      onError={(err) => console.error("PayPal Button Error:", err)} // Add error handling
    />
  );
}