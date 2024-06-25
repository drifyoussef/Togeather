import React from "react";
import "./Card.css";
import { useNavigate } from "react-router-dom";

interface CardProps {
  category: string;
  subcategory: string;
  image: string;
  text: string;
}

export default function Card({
  category,
  subcategory,
  image,
  text,
}: CardProps) {
  const navigate = useNavigate();
  const handleClick = () => {
    //créer une page pour les profile (changer le nom car profile existe déjà)
    navigate("/profile/:id");
    console.log("redirect to route /")
  };
  return (
    <div className="card" onClick={handleClick}>
      <img src={image} alt="person" className="card-image" />
      <div className="card-content">
        <div className="header-card">
          <div className="circle-card"></div>
          <div className="header-card-text">
            <p className="card-title">{category}</p>
            <p className="card-subtitle">{subcategory}</p>
          </div>
        </div>
        <p className="card-text">{text}</p>
      </div>
    </div>
  );
}
