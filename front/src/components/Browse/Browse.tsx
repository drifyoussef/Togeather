import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Browse.css";
import { BiSolidSushi } from "react-icons/bi";
import { FaPizzaSlice, FaHamburger, FaIceCream } from "react-icons/fa";
import { GiChickenOven, GiFrenchFries } from "react-icons/gi";
import { LuSandwich } from "react-icons/lu";
import { RiDrinks2Fill } from "react-icons/ri";
import { PiStarFill } from "react-icons/pi";
import defaultimage from "../../images/restaurants/default-image.jpg";

// Données des restaurants
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
  // Récupérer la catégorie de restaurant
  const { category } = useParams<{ category: string }>();
  // Naviguer vers une autre page
  const navigate = useNavigate();
  // Restaurants (initialisé à un tableau vide)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  // Catégorie active (initialisé à null)
  const [activeCategory, setActiveCategory] = useState<string | null>(category || null);
  // Images des restaurants (initialisé à un objet vide)
  const [imageSrcs, setImageSrcs] = useState<{ [key: string]: string }>({});

  // Mettre à jour la catégorie active
  useEffect(() => {
    if (category) {
      setActiveCategory(category);
    }
  }, [category]);

  useEffect(() => {
    const token = localStorage.getItem("token"); // Récupérer le token
    const location = "46.5151961,-1.778677"; // Coordonnées des Sables d'Olonne
    const radius = 3000; // Rayon de recherche en mètres (3000m = 3km)

    // Fonction pour récupérer les restaurants
    const fetchRestaurants = async () => {
      try {
        // URL de l'API pour récupérer les restaurants
        let url = `${process.env.REACT_APP_API_URL}/api/restaurants?location=${location}&radius=${radius}`;
        // Si une catégorie est active alors ajouter un mot-clé à l'URL
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

        // Récupérer les restaurants
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          method: "GET",
        });

        // Si une erreur survient alors afficher un message d'erreur
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: { results: Restaurant[] } = await response.json(); // Récupérer les données
        setRestaurants(data.results); // Mettre à jour les restaurants

        const displayedPhotoRefs: string[] = []; // Afficher les références des photos

        // Mettre en cache les images des restaurants
        data.results.forEach((restaurant: Restaurant) => {
          if (restaurant.photos && restaurant.photos.length > 0) {
            // Récupérer la référence de la photo du restaurant (première photo)
            const photoRef = restaurant.photos[0].photo_reference;
            // Ajouter la référence de la photo à la liste des photos affichées
            displayedPhotoRefs.push(photoRef);
            // Récupérer l'image en cache
            const cachedImage = localStorage.getItem(photoRef);

            // Si l'image est en cache alors l'ajouter à l'état
            if (cachedImage) {
              setImageSrcs((prev) => ({ ...prev, [restaurant.place_id]: cachedImage }));
            } else {
              fetchImage(photoRef, restaurant.place_id);
            }
          }
        });

        // Supprimer les images non utilisées du cache
        removeUnusedImages(displayedPhotoRefs);
      } catch (error) {
        console.error("Error fetching restaurants: ", error);
      }
    };

    // Fonction pour récupérer l'image du restaurant
    const fetchImage = async (photoRef: string, placeId: string) => {
      try {
        const photoResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/api/restaurant/photo/${photoRef}`
        );
        const photoData = await photoResponse.json();
        const imageSrc = `data:image/jpeg;base64,${photoData.base64Image}`;

        // Limite de stockage de 5 Mo
        const currentStorageSize = JSON.stringify(localStorage).length;
        const newItemSize = photoRef.length + imageSrc.length;

        if (currentStorageSize + newItemSize > 5 * 1024 * 1024) { // 5MB limit
          // Supprimer les images non utilisées du cache
          removeUnusedImages(Object.keys(imageSrcs));
        }

        localStorage.setItem(photoRef, imageSrc);
        setImageSrcs((prev) => ({ ...prev, [placeId]: imageSrc }));
      } catch (error) {
        console.error("Error fetching restaurant image: ", error);
      }
    };

    // Fonction pour supprimer les images non utilisées du cache
    const removeUnusedImages = (displayedPhotoRefs: string[]) => {
      Object.keys(localStorage).forEach((key) => {
        // Supprimer les images non utilisées du cache (clés commençant par "AdCG" et non affichées)
        if (key.startsWith("AdCG") && !displayedPhotoRefs.includes(key)) {
          localStorage.removeItem(key);
        }
      });
    };

    fetchRestaurants();
  }, [activeCategory, imageSrcs]); // Déclencher l'effet si la catégorie active ou les images des restaurants changent

  // Trier les restaurants par note décroissante
  const sortedRestaurants = [...restaurants].sort(
    (a, b) => b.rating - a.rating
  );

  // Afficher les 4 premiers restaurants triés
  const displayRestaurants = sortedRestaurants.slice(0, 4);

  // Gérer le clic sur une catégorie
  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    navigate(`/browse/${category}`);
  };

  // Gérer le clic sur un identifiant (restaurant)
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
    </div>
  );
};

export default Browse;
