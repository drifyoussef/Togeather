import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
   const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
  
    try {
      console.log('Sending request to:', `${process.env.REACT_APP_API_URL}/auth/admin/login`);
      console.log('Request body:', { email, password });

      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
  
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error text:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          setError(errorData.message);
          console.error('Login failed:', errorData);
        } catch {
          setError(errorText);
          console.error('Login failed:', errorText);
        }
      } else {
        const successData = await response.json();
        console.log('Success data:', successData);
        if (successData.token) {
          localStorage.setItem('token', successData.token);
          localStorage.setItem('userId', successData.userId);
          localStorage.setItem('isAdmin', successData.isAdmin);
          navigate('/admin/dashboard');
        } else {
          console.error('Login failed:', successData.message);
        }
      }
    } catch (error) {
      console.error('Error during fetch or response processing:', error);
      setError('Erreur lors du login.');
    }
  };

  return (
    <div className="div-login">
      <form id="loginForm" onSubmit={handleSubmit}>
        <label htmlFor="email">
          Email:
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
         <label htmlFor="password">
          Mot de passe:
          <div className="password-input-container">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit">Se connecter</button>
      </form>
    </div>
  );
};

export default Login;