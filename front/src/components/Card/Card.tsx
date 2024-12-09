import React from "react";
import "./Card.css";
import { useNavigate } from "react-router-dom";
import { BiSolidSushi } from "react-icons/bi";
import { FaPizzaSlice, FaHamburger, FaIceCream } from "react-icons/fa";
import { GiChickenOven, GiTacos } from "react-icons/gi";
import { LuSandwich } from "react-icons/lu";
import { RiDrinks2Fill } from "react-icons/ri";

type Category = 'Asiatique' | 'Pizza' | 'Poulet' | 'Sandwich' | 'Mexicain' | 'Burger' | 'Glaces' | 'Boissons';

interface CardProps {
  imageUrl: string;
  category: Category;
  subcategory: React.ReactNode;
  image: string;
  text: string;
  job: string;
  id: string;
}

const categoryIcons: Record<Category, React.ReactElement> = {
  Asiatique: <BiSolidSushi className="icon-category-card" />,
  Pizza: <FaPizzaSlice className="icon-category-card" />,
  Poulet: <GiChickenOven className="icon-category-card" />,
  Sandwich: <LuSandwich className="icon-category-card" />,
  Mexicain: <GiTacos className="icon-category-card" />,
  Burger: <FaHamburger className="icon-category-card" />,
  Glaces: <FaIceCream className="icon-category-card" />,
  Boissons: <RiDrinks2Fill className="icon-category-card" />
};

export default function Card({
  category,
  subcategory,
  imageUrl,
  text,
  job,
  id,
}: CardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/profile/${id}`);
  };

  return (
    <div className="card" onClick={handleClick}>
      <img src={imageUrl} alt="person" className="card-image" />
      <div className="card-content">
        <div className="card-container">
          <p className="card-text">{text}</p>
          <p className="card-job">{job}</p>
        </div>
        <div className="card-subcontainer">
          <div className="circle-card">
            {categoryIcons[category]}
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
