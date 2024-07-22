import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { registerUser } from "../../services/userService";
import "./Register.css";

const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [firstname, setFirstname] = useState("");
  const [email, setEmail] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const calcAge = (birthdate: string) => {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    const age = calcAge(birthdate);
    const userData = { name, firstname, email, age, password };

    try {
      const response = await registerUser(userData);
      console.log("Utilisateur enregistré avec succès:", response);
      navigate('/');
    } catch (error) {
      console.log(error);
      setError("Erreur lors de l'enregistrement de l'utilisateur.");
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
          Date de naissance:
          <input
            type="date"
            name="age"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
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