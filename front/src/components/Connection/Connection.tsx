import React from "react";
import "./Connection.css";
import { FaArrowRightLong } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import connectionBackground from "../../images/connection_background.jpeg";

export default function Connexion() {
  
  const navigate = useNavigate();

  return (
    <div>
      <div className="top-container">
        <p className="p1-connection">Let's eat together</p>
        <p className="p2-connection">Mangeons ensemble</p>
      </div>
      <div className="div-container-connection">
        <div className="content-container">
          <p className="text-meeting-connection">
            Rencontrez des gens autour d'un bon repas
          </p>
          <p className="text-meeting-connection-lower">
            Discutez avec des personnes pour faire des rencontres amicales
          </p>
          <div className="bottom-container">
            <button onClick={() => {
              navigate("/auth/login");
            }} className="start-button">
              Commencer
              <FaArrowRightLong />
            </button>
          </div>
        </div>
        <div className="image-container">
          <div className="image-bg"></div>
          <img
            className="image-connection"
            src={connectionBackground}
            alt="Connection"
          />
        </div>
      </div>
    </div>
  );
}
