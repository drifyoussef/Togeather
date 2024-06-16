import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { registerUser } from "../../services/userService";
import "./Register.css";

const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [firstname, setFirstname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    const userData = { name, firstname, email, password };
    try {
      const response = await registerUser(userData);
      console.log("Utilisateur enregistré avec succès:", response);
      navigate('/');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="div-register">
      <form id="userForm" onSubmit={handleSubmit}>
        <label>
          Nom:
          <input
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label>
          Prénom:
          <input
            type="text"
            name="firstname"
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
            required
          />
        </label>
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
        <button type="submit">Créer un compte</button>
      </form>
    </div>
  );
};

export default Register;
