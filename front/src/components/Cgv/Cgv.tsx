import React from "react";
import "./Cgv.css";

const Cgv: React.FC = () => {
  return (
    <div className="cgv-container">
      <div className="cgv-content">
        <h1 className="main-title">Conditions Générales de Vente (CGV)</h1>
        <section className="section">
          <h2 className="section-title">1. Objet</h2>
          <p className="section-text">
            Les présentes Conditions Générales de Vente (CGV) régissent les
            modalités de vente des services proposés sur la plateforme
            "Togeather".
          </p>
        </section>

        <section className="section">
          <h2 className="section-title">2. Prix</h2>
          <p className="section-text">
            Les prix des services sont indiqués en euros et incluent toutes les
            taxes applicables. Ils peuvent être modifiés à tout moment sans
            préavis, mais les services seront facturés sur la base des tarifs en
            vigueur au moment de la validation de la commande. Aucun frais
            supplémentaire ne sera facturé sans information préalable du client.
          </p>
        </section>
        <p>© {new Date().getFullYear()} Togeather. Tous droits réservés.</p>
      </div>
    </div>
  );
};

export default Cgv;
