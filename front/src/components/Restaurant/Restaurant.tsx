import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PiStarFill } from "react-icons/pi";
import { FaHome, FaPhoneAlt } from "react-icons/fa";
import "./Restaurant.css";

// Propriétés du composant RestaurantDetails - Mis à jour pour la nouvelle API Places
interface RestaurantDetailsProps {
  opening_hours?: {
    openNow?: boolean; // Format réel de l'API
    open_now?: boolean; // Format legacy pour compatibilité
    weekday_text?: string[];
    weekdayDescriptions?: string[]; // Format réel de l'API
    periods?: Array<{
      open: { day: number; time: string };
      close?: { day: number; time: string };
    }>;
  };
  name: string;
  rating: number;
  formatted_address: string;
  formatted_phone_number?: string;
  website?: string;
  user_ratings_total?: number;
  reviews?: Array<{
    rating: number;
    text: any;
    author_name?: string;
    authorAttribution?: any;
    time?: number;
    publishTime?: string;
  }>;
}

const Restaurant: React.FC = () => {
  // Récupérer l'ID du restaurant à partir des paramètres de l'URL
  const { place_id } = useParams<{ place_id: string }>();
  // Définir l'état du restaurant et des images
  const [restaurant, setRestaurant] = useState<RestaurantDetailsProps | null>(
    null
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    // Récupérer les détails du restaurant
    const fetchRestaurantDetails = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/restaurant/${place_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            method: "GET",
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch restaurant details");
        }
        const data = await response.json();
        setRestaurant(data.result);

        console.log("Restaurant data:", data.result); // Debug pour voir la structure
        console.log("User rating count:", data.result.user_ratings_total); // Debug spécifique pour les avis
        console.log("Opening hours:", data.result.opening_hours); // Debug pour les horaires
      } catch (error) {
        console.error("Error fetching restaurant details:", error);
      }
    };

    fetchRestaurantDetails();
  }, [place_id]);

  if (!restaurant) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="div-container">
      <div className="restaurant-informations">
        <h1 className="restaurant-name">{restaurant.name}</h1>
        <p className="restaurant-status">
          {restaurant.opening_hours?.openNow || restaurant.opening_hours?.open_now ? "Ouvert" : "Fermé"}
        </p>
        {/* Vérifiez si opening_hours et weekday_text/weekdayDescriptions sont définis */}
        {restaurant.opening_hours && (restaurant.opening_hours.weekday_text || restaurant.opening_hours.weekdayDescriptions) && (
          <>
            <ul className="weekday-text">
              {(restaurant.opening_hours.weekdayDescriptions || restaurant.opening_hours.weekday_text || []).map((text, index) => (
                <li key={index} className="weekday-item">
                  {text}
                </li>
              ))}
            </ul>
          </>
        )}
        <p className="restaurant-rating">
          <PiStarFill className="restaurant-rating-icon" />
          {restaurant.rating}
        </p>
        <p className="restaurant-address">
          <FaHome className="restaurant-address-icon" />
          {restaurant.formatted_address}
        </p>
        {restaurant.formatted_phone_number && (
          <p className="restaurant-number">
            <FaPhoneAlt className="restaurant-number-icon" />
            {restaurant.formatted_phone_number}
          </p>
        )}
        {/* Afficher le bouton en fonction de la disponibilité du site web */}
        {restaurant.website && (
          <button
            className="visit-website-button"
            onClick={() => window.open(restaurant.website, "_blank")}
          >
            Visiter le site web du restaurant
          </button>
        )}
      </div>
    </div>
  );
};

export default Restaurant;
