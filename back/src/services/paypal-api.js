const { clientId, clientSecret, baseUrl } = require('../config/paypalConfig');

let fetch;

(async () => {
  fetch = (await import('node-fetch')).default;
})();

async function createOrder(data) {
  const accessToken = await getAccessToken();
  const url = `${baseUrl}/v2/checkout/orders`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "EUR",
            value: data.product.cost,
          },
        },
      ],
    }),
  });

  return handleResponse(response);
}

async function capturePayment(orderId) {
  const accessToken = await getAccessToken();
  const url = `${baseUrl}/v2/checkout/orders/${orderId}/capture`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  return handleResponse(response);
}

async function getAccessToken() {
  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  return data.access_token;
}

function handleResponse(response) {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

module.exports = {
  createOrder,
  capturePayment,
};