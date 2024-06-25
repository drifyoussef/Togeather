import React from "react";
import "./Home.css";
import Card from "../Card/Card";

export default function Home() {
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
            <div className="div1">
              <div className="circle"></div>
              <p className="p-category">Asiatique</p>
            </div>
            <div className="div2">
              <div className="circle"></div>
              <p className="p-category">Pizza</p>
            </div>
            <div className="div3">
              <div className="circle"></div>
              <p className="p-category">Poulet</p>
            </div>
            <div className="div4">
              <div className="circle"></div>
              <p className="p-category">Sandwich</p>
            </div>
            <div className="div5">
              <div className="circle"></div>
              <p className="p-category">Mexicain</p>
            </div>
            <div className="div6">
              <div className="circle"></div>
              <p className="p-category">French tacos</p>
            </div>
            <div className="div7">
              <div className="circle"></div>
              <p className="p-category">Glaces</p>
            </div>
            <div className="div8">
              <div className="circle"></div>
              <p className="p-category">Boissons</p>
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
            <div className="circle"></div>
          </div>
          <div className="div2">
            <div className="circle"></div>
          </div>
          <div className="div3">
            <div className="circle"></div>
          </div>
          <div className="div4">
            <div className="circle"></div>
          </div>
          <div className="div5">
            <div className="circle"></div>
          </div>
          <div className="div6">
            <div className="circle"></div>
          </div>
          <div className="div7">
            <div className="circle"></div>
          </div>
          <div className="div8">
            <div className="circle"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
