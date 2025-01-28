import React from "react";
import "./About.css";

const About: React.FC = () => {
  return (
    <div className="about-container">
      <div className="about-content">
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

        <h1 className="main-title">Conditions Générales de Vente (CGV)</h1>

        <section className="section">
          <h2 className="section-title">1. Objet</h2>
          <p className="section-text">
            Les présentes Conditions Générales de Vente (CGV) régissent les modalités de vente des services proposés sur la plateforme "Togeather".
          </p>
        </section>

        <section className="section">
          <h2 className="section-title">2. Prix</h2>
          <p className="section-text">
            Les prix des services sont indiqués en euros et incluent toutes les taxes applicables.
          </p>
        </section>

        <footer className="footer">
          <p>© {new Date().getFullYear()} Togeather. Tous droits réservés.</p>
        </footer>
      </div>
    </div>
  );
};

export default About;
