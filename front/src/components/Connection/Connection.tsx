import React from "react";
import "./Connection.css";
import { FaMessage } from "react-icons/fa6";
import { FaUser } from "react-icons/fa";
import { MdRestaurant } from "react-icons/md";
import { TbPremiumRights } from "react-icons/tb";

export default function Connexion() {

  const LoginRedirect = () => {
    window.location.href = "/auth/login";
  };
  
  return (
    <div className="div-container-connection">
      <div className="top-container">
        <p className="p1-connection">Let's eat together</p>
        <p className="p2-connection">Mangeons ensemble</p>
      </div>
      <div className="content-container">
        <div className="icons-container">
          <div className="message-container-connexion">
            <FaMessage className="message-icon" />
            <p className="text-icons">Discutez avec les personnes que vous likez</p>
          </div>
          <div className="user-container-connexion">
            <FaUser className="user-icon" />
            <p className="text-icons">Modifiez vos informations quand vous le voulez</p>
          </div>
          <div className="restaurant-container-connexion">
            <MdRestaurant className="restaurant-icon" />
            <p className="text-icons">Decouvrez de nouveaux restaurants</p>
          </div>
          <div className="premium-container-connexion">
            <TbPremiumRights className="premium-icon" />
            <p className="text-icons">Achetez le premium pour avoir des likes illimités</p>
          </div>
        </div>
        <p className="connection">
          <button className="connection-button" onClick={LoginRedirect}>Se connecter</button> pour rencontrer des gens
        </p>
      </div>
    </div>
  );
}
