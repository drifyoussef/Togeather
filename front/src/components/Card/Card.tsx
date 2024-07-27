import React from "react";
import "./Card.css";
import { useNavigate } from "react-router-dom";
import { BiSolidSushi } from "react-icons/bi";

interface CardProps {
  category: string;
  subcategory: React.ReactNode;
  image: string;
  text: string;
  job: string;
}

export default function Card({
  category,
  subcategory,
  image,
  text,
  job,
}: CardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/profile/:id");
  };

  return (
    <div className="card" onClick={handleClick}>
      <img src={image} alt="person" className="card-image" />
      <div className="card-content">
        <div>
          <p className="card-text">{text}</p>
          <p className="card-job">{job}</p>
        </div>
        <div className="header-card">
          <div className="circle-card">
            <BiSolidSushi className="icon-category-card" />
          </div>
          <div className="header-card-text">
            <p className="card-title">{category}</p>
            <p className="card-subtitle">{subcategory}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
