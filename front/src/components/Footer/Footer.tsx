import React from "react";
import "./Footer.css";

const Footer: React.FC = () => (
  <footer className="footer">
    <div className="footer-content">
      <span>&copy; {new Date().getFullYear()} Togeather. Tous droits réservés.</span>
      <span>
        <a href="/about">À propos</a> | <a href="/premium">Premium</a>
      </span>
    </div>
  </footer>
);

export default Footer;