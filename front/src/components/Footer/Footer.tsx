import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import "./Footer.css";
import { useFetchUsers } from "../../hooks/useFetchUsers";
import Swal from "sweetalert2";

const Footer: React.FC = () => {
  const { mutualMatches } = useFetchUsers();
  const navigate = useNavigate();

  const handleClickMessages = () => {
    if (mutualMatches.length > 0) {
      const firstUser = mutualMatches[0];
      localStorage.setItem("selectedUserId", firstUser._id);
      navigate(`/messages/${firstUser._id}`);
      //console.log(firstUser._id, "firstUser ID");
    } else {
      console.error("No mutual matches found");
      Swal.fire({
        icon: "error",
        title: "Il y a un problème...",
        text: "Vous n'avez pas de matchs pour le moment",
        confirmButtonColor: "#AD0051",
      });
      navigate("/");
    }
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <span>
          &copy; {new Date().getFullYear()} Togeather. Tous droits réservés.
        </span>
        <div className="footer-links">
          <span>
            <a href="/cgv">Conditions Générales de Vente</a> |{" "}
            <a href="/cgu">Conditions Générales d'Utilisation</a>
          </span>
          <span>
            <a href="/">Accueil</a> |{" "}
            <a href="/premium">Premium</a> |{" "}
            <a href="/browse">Parcourir</a> |{" "}
            <button 
              onClick={handleClickMessages}
              className="footer-link-button"
            >
              Mes messages
            </button>{" "}
            |{" "}
            <a href="/profile">Mon profil</a>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

