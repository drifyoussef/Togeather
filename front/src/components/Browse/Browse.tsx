import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Browse.css";
import { BiSolidSushi } from "react-icons/bi";
import { FaPizzaSlice, FaHamburger, FaIceCream } from "react-icons/fa";
import { GiChickenOven, GiTacos } from "react-icons/gi";
import { LuSandwich } from "react-icons/lu";
import { RiDrinks2Fill } from "react-icons/ri";
import { PiStarFill } from "react-icons/pi";
import asianImage from "../../images/restaurants/asian.jpg";
import pizzaImage from "../../images/restaurants/pizza.jpg";
import chickenImage from "../../images/restaurants/chicken.jpg";
import sandwichImage from "../../images/restaurants/sandwich.jpg";
import mexicanImage from "../../images/restaurants/mexican.jpg";
import burgerImage from "../../images/restaurants/burger.jpg";
import iceCreamImage from "../../images/restaurants/icecream.jpg";
import coffeeImage from "../../images/restaurants/coffee.jpg";

// Données des restaurants
interface Restaurant {
  place_id: string;
  name: string;
  rating: number;
  opening_hours?: {
    open_now: boolean;
  };
}

const Browse: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(category || null);

  useEffect(() => {
    if (category) {
      setActiveCategory(category);
      fetchRestaurants(category);
    }
  }, [category]);

  const fetchRestaurants = async (category: string) => {
    const token = localStorage.getItem("token");
    const location = "46.5151961,-1.778677"; // Coordonnées des Sables d'Olonne
    const radius = 3000; // Rayon de recherche en mètres (3000m = 3km)

    try {
      const keywordMap: { [key: string]: string } = {
        Asiatique: "chinese",
        Pizza: "pizza",
        Poulet: "chicken",
        Sandwich: "sandwich",
        Mexicain: "mexican",
        Burger: "burger",
        Glaces: "ice cream",
        Boissons: "cafe",
      };

      let url = `${process.env.REACT_APP_API_URL}/api/restaurants?location=${location}&radius=${radius}&keyword=${keywordMap[category]}`;
      //console.log(`Fetching restaurants with URL: ${url}`);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: { results: Restaurant[] } = await response.json();
      //console.log(`API response data:`, data);

      // Trier les restaurants par note décroissante et limiter les résultats à 4 restaurants
      const sortedRestaurants = data.results.sort((a, b) => b.rating - a.rating).slice(0, 4);
      setRestaurants(sortedRestaurants);
      //console.log(`Nombre de restaurants affichés pour la catégorie ${category}: ${sortedRestaurants.length}`);
    } catch (error) {
      console.error("Error fetching restaurants: ", error);
    }
  };

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    navigate(`/browse/${category}`);
    fetchRestaurants(category);
  };

  const handlePlaceIDClick = (place_id: string) => {
    navigate(`/browse/${category}/${place_id}`);
  };

  const getCategoryImage = (category: string) => {
    const imageUrls: { [key: string]: string } = {
      Asiatique: asianImage,
      Pizza: pizzaImage,
      Poulet: chickenImage,
      Sandwich: sandwichImage,
      Mexicain: mexicanImage,
      Burger: burgerImage,
      Glaces: iceCreamImage,
      Boissons: coffeeImage,
    };

    return imageUrls[category];
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
          {["Asiatique", "Pizza", "Poulet", "Sandwich", "Mexicain", "Burger", "Glaces", "Boissons"].map((category) => (
            <div
              key={category}
              className={`div${category} ${activeCategory === category ? "active" : ""}`}
              onClick={() => handleCategoryClick(category)}
            >
              <div className="circle">
                {category === "Asiatique" && <BiSolidSushi className="icon-category" />}
                {category === "Pizza" && <FaPizzaSlice className="icon-category" />}
                {category === "Poulet" && <GiChickenOven className="icon-category" />}
                {category === "Sandwich" && <LuSandwich className="icon-category" />}
                {category === "Mexicain" && <GiTacos className="icon-category" />}
                {category === "Burger" && <FaHamburger className="icon-category" />}
                {category === "Glaces" && <FaIceCream className="icon-category" />}
                {category === "Boissons" && <RiDrinks2Fill className="icon-category" />}
              </div>
              <p className={`p-category ${activeCategory === category ? "active" : ""}`}>
                {category}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="header-container">
          <h1 className="header-container-title">Les plus populaires à proximité</h1>
          <PiStarFill className="icon-title" />
        </div>
        <div className="browse-container">
          {restaurants.map((restaurant) => (
            <div
              className="browse-card"
              key={restaurant.place_id}
              onClick={() => handlePlaceIDClick(restaurant.place_id)}
            >
              <img
                src={getCategoryImage(category || "")}
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
                  <p className="browse-restaurant-review">{restaurant.rating}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Browse;