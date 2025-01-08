import React, { useState, useEffect } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const Login: React.FC = () => {
  // Email et mot de passe
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  // Email non confirmé (par défaut: false)
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);
  const navigate = useNavigate();

  // Gérer la confirmation de l'email
  const handleResendConfirmation = async () => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/resend-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
    } catch (err) {
      console.error('Error:', err);
    }
  };

  // Afficher une alerte si l'utilisateur n'est pas connecté
  useEffect(() => {
    const showSwal = localStorage.getItem("showSwal");
    if (showSwal === "true") {
      Swal.fire({
        icon: "error",
        title: "Il y a un problème...",
        text: `Vous devez être connecté pour avoir acces a cette page !`,
      });
      localStorage.removeItem("showSwal");
    }
  }, [email]);

  // Gérer la soumission du formulaire
  const handleSubmit = async (event: any) => {
    event.preventDefault();
    setError('');
    setEmailNotConfirmed(false);

    // Connexion de l'utilisateur
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message);
        if (errorData.emailNotConfirmed) {
          // Erreur lors de la connexion de l'utilisateur (email non confirmé)
          setEmailNotConfirmed(true);
        }
        console.error('Login failed:', errorData);
      } else {
        // Connexion réussie
        const successData = await response.json();
        //console.log('successdata', successData);
        console.log('Login successful:', successData.message);
        if (successData.token) {
          // Créer un token et le stocke dans le localStorage
          localStorage.setItem('token', successData.token);
          // Stocker l'ID de l'utilisateur actuel dans le localStorage
          localStorage.setItem('currentUserId', successData.userId);
          // Stocker le prénom de l'utilisateur dans le localStorage
          localStorage.setItem('firstname', successData.firstname);
          console.log('userId from login', successData.userId);
          // Rediriger l'utilisateur vers la page d'accueil
          navigate('/');
        } else {
          // Erreur lors de la connexion de l'utilisateur
          console.error('Login failed:', successData.message);
        }
      }
    } catch (error) {
      // Erreur lors de la connexion de l'utilisateur
      console.error('Error:', error);
      setError('Erreur lors du login.');
    }
  };

  return (
    <div className="div-login">
      <form id="loginForm" onSubmit={handleSubmit}>
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Mot de passe:
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit">Se connecter</button>
      </form>
      {emailNotConfirmed && (
        <div>
          <button onClick={() => {handleResendConfirmation(); navigate('/confirm-email')}}>Confirmer votre email</button>
        </div>
      )}
    </div>
  );
};

export default Login;
