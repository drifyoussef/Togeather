import React, { useState } from "react";
import "./Home.css";
import Card from "../Card/Card";
import { BiSolidSushi } from "react-icons/bi";
import { FaPizzaSlice, FaHamburger, FaIceCream } from "react-icons/fa";
import { GiChickenOven, GiTacos } from "react-icons/gi";
import { LuSandwich } from "react-icons/lu";
import { RiDrinks2Fill } from "react-icons/ri";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  return (
    <div className="div">
      <div>
        <div>
          <p className="p1-home">Let's eat together</p>
          <p className="p2-home">Mangeons ensemble</p>
        </div>
        <div className="category">
          <p className="p3-home">Catégories de restaurant</p>
          <div className="parent">
          <div
            className={`div1 ${activeCategory === 'Asiatique' ? 'active' : ''}`}
            onClick={() => setActiveCategory('Asiatique')}
          >
            <div className="circle">
              <BiSolidSushi className="icon-category" />
            </div>
            <p className={`p-category ${activeCategory === 'Asiatique' ? 'active' : ''}`}>Asiatique</p>
          </div>
          <div
            className={`div2 ${activeCategory === 'Pizza' ? 'active' : ''}`}
            onClick={() => setActiveCategory('Pizza')}
          >
            <div className="circle">
              <FaPizzaSlice className="icon-category" />
            </div>
            <p className={`p-category ${activeCategory === 'Pizza' ? 'active' : ''}`}>Pizza</p>
          </div>
          <div
            className={`div3 ${activeCategory === 'Poulet' ? 'active' : ''}`}
            onClick={() => setActiveCategory('Poulet')}
          >
            <div className="circle">
              <GiChickenOven className="icon-category" />
            </div>
            <p className={`p-category ${activeCategory === 'Poulet' ? 'active' : ''}`}>Poulet</p>
          </div>
          <div
            className={`div4 ${activeCategory === 'Sandwich' ? 'active' : ''}`}
            onClick={() => setActiveCategory('Sandwich')}
          >
            <div className="circle">
              <LuSandwich className="icon-category" />
            </div>
            <p className={`p-category ${activeCategory === 'Sandwich' ? 'active' : ''}`}>Sandwich</p>
          </div>
          <div
            className={`div5 ${activeCategory === 'Mexicain' ? 'active' : ''}`}
            onClick={() => setActiveCategory('Mexicain')}
          >
            <div className="circle">
              <GiTacos className="icon-category" />
            </div>
            <p className={`p-category ${activeCategory === 'Mexicain' ? 'active' : ''}`}>Mexicain</p>
          </div>
          <div
            className={`div6 ${activeCategory === 'Burger' ? 'active' : ''}`}
            onClick={() => setActiveCategory('Burger')}
          >
            <div className="circle">
              <FaHamburger className="icon-category" />
            </div>
            <p className={`p-category ${activeCategory === 'Burger' ? 'active' : ''}`}>Burger</p>
          </div>
          <div
            className={`div7 ${activeCategory === 'Glaces' ? 'active' : ''}`}
            onClick={() => setActiveCategory('Glaces')}
          >
            <div className="circle">
              <FaIceCream className="icon-category" />
            </div>
            <p className={`p-category ${activeCategory === 'Glaces' ? 'active' : ''}`}>Glaces</p>
          </div>
          <div
            className={`div8 ${activeCategory === 'Boissons' ? 'active' : ''}`}
            onClick={() => setActiveCategory('Boissons')}
          >
            <div className="circle">
              <RiDrinks2Fill className="icon-category" />
            </div>
            <p className={`p-category ${activeCategory === 'Boissons' ? 'active' : ''}`}>Boissons</p>
          </div>
        </div>
        </div>
        <div className="div-card">
          <Card
            category="Asiatique"
            subcategory="Test"
            image="https://architecture.ou.edu/wp-content/uploads/2018/07/ANGELAPERSON-1447-300x300.jpg"
            text="Emily, 25 ans"
          />
          <Card
            category="Asiatique"
            subcategory="Test"
            image="https://architecture.ou.edu/wp-content/uploads/2018/07/ANGELAPERSON-1447-300x300.jpg"
            text="Emily, 25 ans"
          />
          <Card
            category="Asiatique"
            subcategory="Test"
            image="https://architecture.ou.edu/wp-content/uploads/2018/07/ANGELAPERSON-1447-300x300.jpg"
            text="Emily, 25 ans"
          />
          <Card
            category="Asiatique"
            subcategory="Test"
            image="https://architecture.ou.edu/wp-content/uploads/2018/07/ANGELAPERSON-1447-300x300.jpg"
            text="Emily, 25 ans"
          />
          <Card
            category="Asiatique"
            subcategory="Test"
            image="https://architecture.ou.edu/wp-content/uploads/2018/07/ANGELAPERSON-1447-300x300.jpg"
            text="Emily, 25 ans"
          />
        </div>
      </div>
      <div className="div-match">
        <p className="p-match">Mes matchs</p>
        <div className="parent">
          <div className="div1">
            <div className="circle">
              <img
                className="image-match"
                src="https://architecture.ou.edu/wp-content/uploads/2018/07/ANGELAPERSON-1447-300x300.jpg"
                alt="match-person"
              />
            </div>
          </div>
          <div className="div2">
            <div className="circle">
              <img
                className="image-match"
                src="https://architecture.ou.edu/wp-content/uploads/2018/07/ANGELAPERSON-1447-300x300.jpg"
                alt="match-person"
              />
            </div>
          </div>
          <div className="div3">
            <div className="circle">
              <img
                className="image-match"
                src="https://architecture.ou.edu/wp-content/uploads/2018/07/ANGELAPERSON-1447-300x300.jpg"
                alt="match-person"
              />
            </div>
          </div>
          <div className="div4">
            <div className="circle">
              <img
                className="image-match"
                src="https://architecture.ou.edu/wp-content/uploads/2018/07/ANGELAPERSON-1447-300x300.jpg"
                alt="match-person"
              />
            </div>
          </div>
          <div className="div5">
            <div className="circle">
              <img
                className="image-match"
                src="https://architecture.ou.edu/wp-content/uploads/2018/07/ANGELAPERSON-1447-300x300.jpg"
                alt="match-person"
              />
            </div>
          </div>
          <div className="div6">
            <div className="circle">
              <img
                className="image-match"
                src="https://architecture.ou.edu/wp-content/uploads/2018/07/ANGELAPERSON-1447-300x300.jpg"
                alt="match-person"
              />
            </div>
          </div>
          <div className="div7">
            <div className="circle">
              <img
                className="image-match"
                src="https://architecture.ou.edu/wp-content/uploads/2018/07/ANGELAPERSON-1447-300x300.jpg"
                alt="match-person"
              />
            </div>
          </div>
          <div className="div8">
            <div className="circle">
              <img
                className="image-match"
                src="https://architecture.ou.edu/wp-content/uploads/2018/07/ANGELAPERSON-1447-300x300.jpg"
                alt="match-person"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
