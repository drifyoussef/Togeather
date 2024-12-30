import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import "./ConfirmEmail.css";
import { IoIosMail } from "react-icons/io";
import Swal from 'sweetalert2';

const ConfirmEmail: React.FC<{ data: { message: string } }> = ({ data }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const navigateToSuccess = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    console.log('Query Params:', queryParams.toString());
    console.log('Token from ConfirmEmail:', token);

    if (token) {
      fetch(`http://localhost:4000/account/verify?token=${encodeURIComponent(token)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(response => {
          console.log('Response Status:', response.status);
          return response.json();
        })
        .then(data => {
          console.log('Response Data:', data);
          if (data.message === 'Email confirmed successfully') {
            // Store the token in localStorage or any other storage
            localStorage.setItem('token', data.token);
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
  
  useEffect(() => {
    if (data.message === 'Email confirmed successfully') {
      Swal.fire({
        icon: 'success',
        title: 'Email confirmé avec succès',
        text: 'Vous pouvez maintenant vous connecter',
      });
      navigateToSuccess('/login'); // Redirect to the success page
    }
  }, [data, navigateToSuccess]);

  return (
    <div className='confirm-email'>
      <IoIosMail className='confirm-icon' />
      <h1 className='header-confirm-text'>Mail de confirmation envoyé</h1>
      <p>Veuillez regarder votre boite mail <br /> et cliquez sur le lien de confirmation pour activer votre compte
      </p>
      <p className='text-spam'>Si vous ne le voyez pas veuillez vérifier vos spams</p>
    </div>
  );
};

export default ConfirmEmail;