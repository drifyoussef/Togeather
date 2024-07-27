import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Browse.css";
import { BiSolidSushi } from "react-icons/bi";
import { FaPizzaSlice, FaHamburger, FaIceCream, FaHeart } from "react-icons/fa";
import { GiChickenOven, GiFrenchFries } from "react-icons/gi";
import { LuSandwich } from "react-icons/lu";
import { RiDrinks2Fill } from "react-icons/ri";
import { PiStarFill } from "react-icons/pi";
import Tacos from "../../../src/images/restaurants/tacos_avenue.jpeg";
import defaultimage from "../../images/restaurants/default-image.jpg"

// Define the interface for the restaurant data
interface Restaurant {
  place_id: string;
  name: string;
  rating: number;
  photos?: { photo_reference: string }[];
  opening_hours?: {
    open_now: boolean;
  };
}

const Browse = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(category || null);

  useEffect(() => {
    if (category) {
      setActiveCategory(category);
    }
  }, [category]);

  useEffect(() => {
    const location = "44.12977637655348,4.107153080220958"; // Coordonnées de burger king d'ales
    const radius = 3000; // Radius en metres

    const fetchRestaurants = async () => {
      try {
        let url = `${process.env.REACT_APP_API_URL}/api/restaurants?location=${location}&radius=${radius}`;
        if (activeCategory) {
          const keywordMap: { [key: string]: string } = {
            'Asiatique': 'chinese',
            'Pizza': 'pizza',
            'Poulet': 'chicken',
            'Sandwich': 'sandwich',
            'Burger': 'burger',
            'Glaces': 'ice cream',
            'Boissons': 'cafe',
            'Fast Food': 'fast food',
          };
          url += `&keyword=${keywordMap[activeCategory]}`;
        }
        const response = await fetch(url);
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
  }, [activeCategory]);

  const sortedRestaurants = [...restaurants].sort(
    (a, b) => b.rating - a.rating
  );

  const displayRestaurants = sortedRestaurants.slice(0, 4);

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    navigate(`/browse/${category}`);
  };

  return (
    <div>
      <div>
        <p className="p1-home">Let's eat together</p>
        <p className="p2-home">Mangeons ensemble</p>
      </div>
      <div className="category">
        <p className="p3-home">Catégories de restaurant</p>
        <div className="parent">
          {['Asiatique', 'Pizza', 'Poulet', 'Sandwich', 'Burger', 'Glaces', 'Boissons', 'Fast Food'].map(category => (
            <div
              key={category}
              className={`div${category} ${activeCategory === category ? 'active' : ''}`}
              onClick={() => handleCategoryClick(category)}
            >
              <div className="circle">
                {category === 'Asiatique' && <BiSolidSushi className="icon-category" />}
                {category === 'Pizza' && <FaPizzaSlice className="icon-category" />}
                {category === 'Poulet' && <GiChickenOven className="icon-category" />}
                {category === 'Sandwich' && <LuSandwich className="icon-category" />}
                {category === 'Burger' && <FaHamburger className="icon-category" />}
                {category === 'Glaces' && <FaIceCream className="icon-category" />}
                {category === 'Boissons' && <RiDrinks2Fill className="icon-category" />}
                {category === 'Fast Food' && <GiFrenchFries className="icon-category" />}
              </div>
              <p className={`p-category ${activeCategory === category ? 'active' : ''}`}>{category}</p>
            </div>
          ))}
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
                    : defaultimage
                }
                alt={restaurant.name}
                className="browse-image"
              />
              <div className="browse-details">
                <div className="browse-h2">
                  <div>
                    <h2 className="browse-name">{restaurant.name}</h2>
                    <p className="open-status">
                      {restaurant.opening_hours?.open_now ? "Ouvert" : "Fermé"}
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
