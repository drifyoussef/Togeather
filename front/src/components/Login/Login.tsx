import React, { useState, useEffect } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);
  const navigate = useNavigate();

  //localsotrage token
  //const token = localStorage.getItem("token");

  //console.log("token DU LOGIN", token);

  //TOKEN DU LOGIN EST NULL CE QUI EST NORMAL LOGIQUEMENT

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

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    setError('');
    setEmailNotConfirmed(false);

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
          setEmailNotConfirmed(true);
        }
        console.error('Login failed:', errorData);
      } else {
        const successData = await response.json();
        //console.log('successdata', successData);
        console.log('Login successful:', successData.message);
        if (successData.token) {
          localStorage.setItem('token', successData.token);
          localStorage.setItem('currentUserId', successData.userId); // Store the user ID
          localStorage.setItem('firstname', successData.firstname);
          console.log('userId from login', successData.userId);
          navigate('/');
        } else {
          // Handle login error
          console.error('Login failed:', successData.message);
        }
      }
    } catch (error) {
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
