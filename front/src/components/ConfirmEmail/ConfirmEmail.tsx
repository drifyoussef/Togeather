import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import "./ConfirmEmail.css";
import { IoIosMail } from "react-icons/io";
import Swal from 'sweetalert2';

const ConfirmEmail: React.FC<{ data: { message: string } }> = ({ data }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    console.log('Query Params:', queryParams.toString());
    console.log('Token from ConfirmEmail:', token);

    if (token) {
      console.log('Token found, making fetch request...');
      fetch(`http://localhost:4000/account/verify/${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(response => {
          console.log('Response status:', response.status);
          return response.json();
        })
        .then(data => {
          console.log('Data from confirm email:', data);
          if (data.message === 'Email confirmed successfully') {
            console.log('Email confirmed successfully, showing Swal...');
              console.log('navigating to /auth/login');
              Swal.fire({
                icon: 'success',
                title: 'Succès',
                text: 'Votre email a été confirmé avec succès',
              });
              navigate('/auth/login');
          } else {
            console.log('Email confirmation failed, showing error Swal...');
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: data.message,
            });
          }
        })
        .catch(error => {
          console.error('Error during fetch:', error);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Une erreur est survenue lors de la confirmation de l\'email',
          });
        });
    } else {
      console.log('No token found in the URL');
      console.error('No token found in the URL');
    }
  }, [location, navigate]);

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