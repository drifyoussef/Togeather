import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BiSolidSushi } from "react-icons/bi";
import { FaPizzaSlice, FaHamburger, FaIceCream, FaHeart } from "react-icons/fa";
import { GiChickenOven, GiTacos } from "react-icons/gi";
import { LuSandwich } from "react-icons/lu";
import { RiDrinks2Fill } from "react-icons/ri";
import Card from "../Card/Card";
import { useFetchUsers } from "../../hooks/useFetchUsers";
import "./Home.css";
import { useImageFallback } from "../../hooks/useImageFallback";

// Catégories disponibles
type Category =
  | "Asiatique"
  | "Pizza"
  | "Poulet"
  | "Sandwich"
  | "Mexicain"
  | "Burger"
  | "Glaces"
  | "Boissons";

// Composant principal Home
export default function Home() {
  // Catégorie active (par défaut: null)
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  // Chargement des utilisateurs (par défaut: true)
  const [loading, setLoading] = useState(true); 
  const navigate = useNavigate();
  // Récupérer les utilisateurs, le genre préféré et les matchs mutuels
  const { users, preferredGender, mutualMatches } = useFetchUsers();

  useEffect(() => {
    // Vérifier si des utilisateurs sont disponibles
    if (users.length > 0) {
      setLoading(false); // Désactiver le chargement
    }
  }, [users]);

  // Gérer le clic sur une catégorie de restaurant
  const handleCategoryClick = (category: Category) => {
    setActiveCategory(category);
    navigate(`/browse/${category}`);
  };

  // Gérer le clic pour la navigation vers la page de messages
  const handleUserinfosClick = (user: any) => {
    localStorage.setItem("selectedUserId", user._id);
    navigate(`/messages/${user._id}`);
  };

  // Obtenir la sous-catégorie de genre préférée (Hommes, Femmes ou les deux)
  const getGenderSubcategory = (preferredGender: string) => {
    switch (preferredGender) {
      case "both":
        return <>H & F</>;
      case "homme":
        return <>Hommes</>;
      case "femme":
        return <>Femmes</>;
      default:
        return null;
    }
  };

  const { handleImageError } = useImageFallback();

  // Filtrer les utilisateurs par genre préféré
  const currentUserId = localStorage.getItem("currentUserId");
  const filteredUsersList = users.filter(
    (user: any) =>
      (preferredGender === "both" ? true : user.userGender === preferredGender) &&
      user._id !== currentUserId // <-- On enlève l'utilisateur connecté ici
  );

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
              className={`div1 ${
                activeCategory === "Asiatique" ? "active" : ""
              }`}
              onClick={() => handleCategoryClick("Asiatique")}
            >
              <div className="circle">
                <BiSolidSushi className="icon-category" />
              </div>
              <p
                className={`p-category ${
                  activeCategory === "Asiatique" ? "active" : ""
                }`}
              >
                Asiatique
              </p>
            </div>
            <div
              className={`div2 ${activeCategory === "Pizza" ? "active" : ""}`}
              onClick={() => handleCategoryClick("Pizza")}
            >
              <div className="circle">
                <FaPizzaSlice className="icon-category" />
              </div>
              <p
                className={`p-category ${
                  activeCategory === "Pizza" ? "active" : ""
                }`}
              >
                Pizza
              </p>
            </div>
            <div
              className={`div3 ${activeCategory === "Poulet" ? "active" : ""}`}
              onClick={() => handleCategoryClick("Poulet")}
            >
              <div className="circle">
                <GiChickenOven className="icon-category" />
              </div>
              <p
                className={`p-category ${
                  activeCategory === "Poulet" ? "active" : ""
                }`}
              >
                Poulet
              </p>
            </div>
            <div
              className={`div4 ${
                activeCategory === "Sandwich" ? "active" : ""
              }`}
              onClick={() => handleCategoryClick("Sandwich")}
            >
              <div className="circle">
                <LuSandwich className="icon-category" />
              </div>
              <p
                className={`p-category ${
                  activeCategory === "Sandwich" ? "active" : ""
                }`}
              >
                Sandwich
              </p>
            </div>
            <div
              className={`div5 ${
                activeCategory === "Mexicain" ? "active" : ""
              }`}
              onClick={() => handleCategoryClick("Mexicain")}
            >
              <div className="circle">
                <GiTacos className="icon-category" />
              </div>
              <p
                className={`p-category ${
                  activeCategory === "Mexicain" ? "active" : ""
                }`}
              >
                Mexicain
              </p>
            </div>
            <div
              className={`div6 ${activeCategory === "Burger" ? "active" : ""}`}
              onClick={() => handleCategoryClick("Burger")}
            >
              <div className="circle">
                <FaHamburger className="icon-category" />
              </div>
              <p
                className={`p-category ${
                  activeCategory === "Burger" ? "active" : ""
                }`}
              >
                Burger
              </p>
            </div>
            <div
              className={`div7 ${activeCategory === "Glaces" ? "active" : ""}`}
              onClick={() => handleCategoryClick("Glaces")}
            >
              <div className="circle">
                <FaIceCream className="icon-category" />
              </div>
              <p
                className={`p-category ${
                  activeCategory === "Glaces" ? "active" : ""
                }`}
              >
                Glaces
              </p>
            </div>
            <div
              className={`div8 ${
                activeCategory === "Boissons" ? "active" : ""
              }`}
              onClick={() => handleCategoryClick("Boissons")}
            >
              <div className="circle">
                <RiDrinks2Fill className="icon-category" />
              </div>
              <p
                className={`p-category ${
                  activeCategory === "Boissons" ? "active" : ""
                }`}
              >
                Boissons
              </p>
            </div>
          </div>
        </div>
        <div className="div-card">
          {loading ? (
            <p className="loading-users">Chargement des utilisateurs...</p> // chargement
          ) : filteredUsersList.length > 0 ? (
            filteredUsersList.map((user: any) => (
              <Card
                key={user._id}
                category={user.favoriteCategory as Category}
                subcategory={
                  <>
                    <FaHeart className="icon-title icon-heart-home" />
                    {getGenderSubcategory(user.preferredGender)}
                  </>
                }
                imageUrl={
                  user.imageUrl ||
                  "https://www.w3schools.com/w3images/avatar2.png"
                } // Image par défaut si non disponible
                image={
                  user.imageUrl ||
                  "https://www.w3schools.com/w3images/avatar2.png"
                } // Image par défaut si non disponible
                text={`${user.firstname}, ${user.age} ans`}
                job={user.job}
                id={user._id}
              />
            ))
          ) : (
            <p>Il n'y a pas d'utilisateur disponible.</p>
          )}
        </div>
      </div>
      <div className="div-match">
        <p className="p-match">Mes matchs</p>
        <div className="parent-match">
          <div className="div-circle-match">
            <div className="circle-match-home">
              {loading ? (
            <p>Chargement des matchs...</p> // Show loading indicator
          ) : mutualMatches.length > 0 ? (
                mutualMatches.map((user:any) => (
                  <div
                    key={user._id}
                    className="user-card"
                    onClick={() => handleUserinfosClick(user)}
                  >
                    <img src={`${process.env.REACT_APP_API_URL}/${user.imageUrl}`} alt={`${user.firstname}'s avatar`} className="match-card-image" onError={handleImageError} />
                  </div>
                ))
              ) : (
                <p>Vous n'avez pas de matchs.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
