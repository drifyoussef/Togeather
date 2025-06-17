import React from "react";
import "./Footer.css";

const Footer: React.FC = () => (
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
          <a href="/messages">Mes messages</a> |{" "}
          <a href="/profile">Mon profil</a>
        </span>
      </div>
    </div>
  </footer>
);

export default Footer;
