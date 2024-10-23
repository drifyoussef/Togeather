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
import defaultimage from "../../images/restaurants/default-image.jpg";

interface Restaurant {
  place_id: string;
  name: string;
  rating: number;
  photos?: { photo_reference: string }[];
  opening_hours?: {
    open_now: boolean;
  };
}

const Browse: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(category || null);
  const [imageSrcs, setImageSrcs] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (category) {
      setActiveCategory(category);
    }
  }, [category]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const location = "46.5151961,-1.778677"; // Coordinates of Leclerc des Sables d'Olonne
    const radius = 3000; // Radius in meters

    const fetchRestaurants = async () => {
      try {
        let url = `${process.env.REACT_APP_API_URL}/api/restaurants?location=${location}&radius=${radius}`;
        if (activeCategory) {
          const keywordMap: { [key: string]: string } = {
            Asiatique: "chinese",
            Pizza: "pizza",
            Poulet: "chicken",
            Sandwich: "sandwich",
            Burger: "burger",
            Glaces: "ice cream",
            Boissons: "cafe",
            "Fast Food": "fast food",
          };
          url += `&keyword=${keywordMap[activeCategory]}`;
        }

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          method: "GET",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: { results: Restaurant[] } = await response.json(); // Specify the type of `data`
        setRestaurants(data.results);

        const displayedPhotoRefs: string[] = []; // Track displayed photo references

        // Cache images for each restaurant
        data.results.forEach((restaurant: Restaurant) => {
          if (restaurant.photos && restaurant.photos.length > 0) {
            const photoRef = restaurant.photos[0].photo_reference;
            displayedPhotoRefs.push(photoRef); // Add to the array of displayed references
            const cachedImage = localStorage.getItem(photoRef);

            if (cachedImage) {
              setImageSrcs((prev) => ({ ...prev, [restaurant.place_id]: cachedImage }));
            } else {
              fetchImage(photoRef, restaurant.place_id);
            }
          }
        });

        // Remove unused images from local storage
        removeUnusedImages(displayedPhotoRefs);
      } catch (error) {
        console.error("Error fetching restaurants: ", error);
      }
    };

    const fetchImage = async (photoRef: string, placeId: string) => {
      try {
        const photoResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/api/restaurant/photo/${photoRef}`
        );
        const photoData = await photoResponse.json();
        const imageSrc = `data:image/jpeg;base64,${photoData.base64Image}`;

        // Check storage limits
        const currentStorageSize = JSON.stringify(localStorage).length;
        const newItemSize = photoRef.length + imageSrc.length;

        if (currentStorageSize + newItemSize > 5 * 1024 * 1024) { // 5MB limit
          // Optionally, clear some old items
          removeUnusedImages(Object.keys(imageSrcs));
        }

        localStorage.setItem(photoRef, imageSrc);
        setImageSrcs((prev) => ({ ...prev, [placeId]: imageSrc }));
      } catch (error) {
        console.error("Error fetching restaurant image: ", error);
      }
    };

    const removeUnusedImages = (displayedPhotoRefs: string[]) => {
      Object.keys(localStorage).forEach((key) => {
        // Remove items that start with "AdCG" and are not displayed
        if (key.startsWith("AdCG") && !displayedPhotoRefs.includes(key)) {
          localStorage.removeItem(key);
        }
      });
    };

    fetchRestaurants();
  }, [activeCategory, imageSrcs]); // Added imageSrcs to the dependency array

  const sortedRestaurants = [...restaurants].sort(
    (a, b) => b.rating - a.rating
  );

  const displayRestaurants = sortedRestaurants.slice(0, 4);

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    navigate(`/browse/${category}`);
  };

  const handlePlaceIDClick = (place_id: string) => {
    navigate(`/browse/${category}/${place_id}`);
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
          {["Asiatique", "Pizza", "Poulet", "Sandwich", "Burger", "Glaces", "Boissons", "Fast Food"].map((category) => (
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
                {category === "Burger" && <FaHamburger className="icon-category" />}
                {category === "Glaces" && <FaIceCream className="icon-category" />}
                {category === "Boissons" && <RiDrinks2Fill className="icon-category" />}
                {category === "Fast Food" && <GiFrenchFries className="icon-category" />}
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
          {displayRestaurants.map((restaurant) => (
            <div
              className="browse-card"
              key={restaurant.place_id}
              onClick={() => handlePlaceIDClick(restaurant.place_id)}
            >
              <img
                src={imageSrcs[restaurant.place_id] || defaultimage}
                alt={restaurant.name}
                className="browse-image"
                onError={(e) => {
                  e.currentTarget.src = defaultimage; // Fallback to default image
                }}
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
      <div>
        <div className="header-container">
          <h1 className="header-container-title">Les coups de coeurs de la semaine</h1>
          <FaHeart className="icon-title icon-heart" />
        </div>
        <div className="browse-container">
          {[...Array(4)].map((_, index) => (
            <div className="browse-card" key={index}>
              <img src={Tacos} alt="" className="browse-image" />
              <div className="browse-details">
                <div className="browse-h2">
                  <div>
                    <h2 className="browse-name">Nom de restaurant {index + 1}</h2>
                    <p className="open-status">Ouvert</p>
                  </div>
                  <p className="browse-restaurant-review">5.0</p>
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
