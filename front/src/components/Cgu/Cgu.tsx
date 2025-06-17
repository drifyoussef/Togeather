import React from "react";
import "./Cgu.css";

const Cgu: React.FC = () => {
  return (
    <div className="cgu-container">
      <div className="cgu-content">
        <h1 className="main-title">Conditions Générales d'Utilisation (CGU)</h1>
        
        <section className="section">
          <h2 className="section-title">1. Objet</h2>
          <p className="section-text">
            Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les modalités et politique de confidentialité de la plateforme "Togeather".
          </p>
        </section>

        <section className="section">
          <h2 className="section-title">2. Acceptation des CGU</h2>
          <p className="section-text">
            En accédant et en utilisant la plateforme, l'utilisateur accepte sans réserve les présentes CGU.
          </p>
        </section>

        <section className="section">
          <h2 className="section-title">3. Services proposés</h2>
          <p className="section-text">
            "Togeather" offre une plateforme de rencontre amicale avec un système de messagerie instantanée mais également offre la possibilité de voir les restaurants autour de vous.
          </p>
          <p className="section-text">Ce site web propose également un service premium permettant de liker des profils en illimité.</p>
        </section>
          <p>© {new Date().getFullYear()} Togeather. Tous droits réservés.</p>
      </div>
    </div>
  );
};

export default Cgu;
