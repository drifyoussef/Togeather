import React from "react";
import "./Card.css";

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
  return (
    <div className="card">
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
