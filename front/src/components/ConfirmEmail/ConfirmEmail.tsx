import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ConfirmEmail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get('id');

    if (id) {
      fetch('https://localhost:3000/confirm-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.message === 'Email confirmed successfully') {
            navigate('/login');
          } else {
            console.error('Error confirming email:', data.message);
          }
        })
        .catch(error => {
          console.error('Error confirming email:', error);
        });
    }
  }, [location, navigate]);

  return (
    <div>Veuillez confirmer votre mail</div>
  );
};

export default ConfirmEmail;