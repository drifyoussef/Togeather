import React, { useState, useEffect } from "react";
import "./Browse.css";
import { BiSolidSushi } from "react-icons/bi";
import { FaPizzaSlice, FaHamburger, FaIceCream, FaHeart } from "react-icons/fa";
import { GiChickenOven, GiTacos } from "react-icons/gi";
import { LuSandwich } from "react-icons/lu";
import { RiDrinks2Fill } from "react-icons/ri";
import { PiStarFill } from "react-icons/pi";
import Tacos from "../../../src/images/restaurants/tacos_avenue.jpeg";

// Define the interface for the restaurant data
interface Restaurant {
  place_id: string;
  name: string;
  rating: number;
  photos?: { photo_reference: string }[];
  opening_hours: {
    open_now: boolean;
  };
}

const Browse = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  useEffect(() => {
    const location = "44.12977637655348,4.107153080220958"; // Coordonnées de burger king d'ales
    const radius = 3000; // Radius en metres

    const fetchRestaurants = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/restaurants?location=${location}&radius=${radius}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched data: ", data); // Log de data
        setRestaurants(data.results);
      } catch (error) {
        console.error("Error fetching restaurants: ", error);
      }
    };

    fetchRestaurants();
  }, []);

  const sortedRestaurants = [...restaurants].sort(
    (a, b) => b.rating - a.rating
  );

  const displayRestaurants = sortedRestaurants.slice(0, 4);

  return (
    <div>
      <div>
        <p className="p1-home">Let's eat together</p>
        <p className="p2-home">Mangeons ensemble</p>
      </div>
      <div className="category">
        <p className="p3-home">Catégories de restaurant</p>
        <div className="parent">
          <div className="div1">
            <div className="circle">
              <BiSolidSushi className="icon-category" />
            </div>
            <p className="p-category">Asiatique</p>
          </div>
          <div className="div2">
            <div className="circle">
              <FaPizzaSlice className="icon-category" />
            </div>
            <p className="p-category">Pizza</p>
          </div>
          <div className="div3">
            <div className="circle">
              <GiChickenOven className="icon-category" />
            </div>
            <p className="p-category">Poulet</p>
          </div>
          <div className="div4">
            <div className="circle">
              <LuSandwich className="icon-category" />
            </div>
            <p className="p-category">Sandwich</p>
          </div>
          <div className="div5">
            <div className="circle">
              <GiTacos className="icon-category" />
            </div>
            <p className="p-category">Mexicain</p>
          </div>
          <div className="div6">
            <div className="circle">
              <FaHamburger className="icon-category" />
            </div>
            <p className="p-category">Burger</p>
          </div>
          <div className="div7">
            <div className="circle">
              <FaIceCream className="icon-category" />
            </div>
            <p className="p-category">Glaces</p>
          </div>
          <div className="div8">
            <div className="circle">
              <RiDrinks2Fill className="icon-category" />
            </div>
            <p className="p-category">Boissons</p>
          </div>
        </div>
      </div>
      <div>
        <div className="header-container">
          <h1 className="header-container-title">
            Les plus populaires à proximité
          </h1>
          <PiStarFill className="icon-title" />
        </div>
        <div className="browse-container">
          {displayRestaurants.map((restaurant) => (
            <div className="browse-card" key={restaurant.place_id}>
              <img
                src={
                  restaurant.photos
                    ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${restaurant.photos[0].photo_reference}&key=AIzaSyA8YrxzYR9Gix93tZ-x4aVIekH4EGoQhx4`
                    : "default-image.jpg"
                }
                alt={restaurant.name}
                className="browse-image"
              />
              <div className="browse-details">
                <div className="browse-h2">
                  <div>
                    <h2 className="browse-name">{restaurant.name}</h2>
                    <p className="open-status">
                      {restaurant.opening_hours.open_now ? "Ouvert" : "Fermé"}
                    </p>
                  </div>
                  <p className="browse-restaurant-review">
                    {restaurant.rating}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="header-container">
          <h1 className="header-container-title">
            Les coups de coeurs de la semaine
          </h1>
          <FaHeart className="icon-title icon-heart" />
        </div>
        <div className="browse-container">
          <div className="browse-card">
            <img src={Tacos} alt="" className="browse-image" />
            <div className="browse-details">
              <div className="browse-h2">
                <h2 className="browse-name">Tacos avenue</h2>
                <p className="browse-restaurant-review">4.1</p>
              </div>
            </div>
          </div>
          <div className="browse-card">
            <img src={Tacos} alt="" className="browse-image" />
            <div className="browse-details">
              <div className="browse-h2">
                <h2 className="browse-name">Tacos avenue</h2>
                <p className="browse-restaurant-review">4.1</p>
              </div>
            </div>
          </div>
          <div className="browse-card">
            <img src={Tacos} alt="" className="browse-image" />
            <div className="browse-details">
              <div className="browse-h2">
                <h2 className="browse-name">Tacos avenue</h2>
                <p className="browse-restaurant-review">4.1</p>
              </div>
            </div>
          </div>
          <div className="browse-card">
            <img src={Tacos} alt="" className="browse-image" />
            <div className="browse-details">
              <div className="browse-h2">
                <h2 className="browse-name">Tacos avenue</h2>
                <p className="browse-restaurant-review">4.1</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div></div>
    </div>
  );
};

export default Browse;
