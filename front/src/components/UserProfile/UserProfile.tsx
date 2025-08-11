import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { GoHeart, GoHeartFill } from "react-icons/go";
import { UserModel } from "../../models/User.model";
import Swal from "sweetalert2";

import "./UserProfile.css";
import { useImageFallback } from "../../hooks/useImageFallback";

const UserProfile: React.FC = () => {
  // Récupérer l'ID de l'utilisateur à partir des paramètres de l'URL
  const { id } = useParams<{ id: string }>();
  // Définir l'état de l'utilisateur et de l'indicateur "liked"
  const [user, setUser] = useState<UserModel | null>(null);
  const [liked, setLiked] = useState(false);
  const [reload, setReload] = useState(false);

  const { handleImageError } = useImageFallback();

  // Fonction pour liker un utilisateur
  const likeUser = () => {
    const token = localStorage.getItem("token");
    const currentUserId = localStorage.getItem("currentUserId");

    fetch(`${process.env.REACT_APP_API_URL}/auth/users/${id}/like`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ liked: true, currentUserId }),
    })
      .then(async (response) => {
        if (response.status === 403) {
          const data = await response.json();
          Swal.fire({
            title: "Limite atteinte",
            text:
              data.message ||
              "Vous devez être premium pour avoir plus de likes.",
            icon: "warning",
            confirmButtonColor: "#AD0051",
          });
          return null; // Ne pas liker si 403
        }
        return response.json();
      })
      .then((data) => {
        if (data && data.liked) {
          setLiked(true);
          setReload(true);
        }
        // Si data est null (cas 403), rien ne se passe, le cœur reste non rempli
      })
      .catch((error) => {
        console.error("Error liking user:", error);
      });
  };

  // Fonction pour unliker un utilisateur
  const unlikeUser = () => {
    const token = localStorage.getItem("token");
    //console.log('token when unlike user', token);
    const currentUserId = localStorage.getItem("currentUserId");

    fetch(`${process.env.REACT_APP_API_URL}/auth/users/${id}/like`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ liked: false, currentUserId }),
    })
      .then((response) => response.json())
      .then((data) => {
        setLiked(false);
        setReload(true); // Trigger reload to refresh the state
      })
      .catch((error) => {
        console.error("Error unliking user:", error);
      });
  };

  // Récupérer les détails de l'utilisateur connecté à partir de l'API
  useEffect(() => {
    const token = localStorage.getItem("token");
    const currentUserId = localStorage.getItem("currentUserId");
    //console.log(currentUserId, 'currentUserId from UserProfile');
    if (id && currentUserId) {
      fetch(`${process.env.REACT_APP_API_URL}/auth/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: "GET",
      })
        .then((response) => response.json())
        .then((data) => {
          setUser(data);
          setLiked(data.likedBy.includes(currentUserId)); // Explicitly set liked state

          if (data.message) {
            //console.log(data.message);
          }
        })
        .catch((error) => {
          console.error("Error fetching user details:", error);
        });
    }
  }, [id, reload]); // Add reload as a dependency

  // log de l'état du like
  useEffect(() => {
    //console.log('Rendering with liked state:', liked);
  }, [liked]);

  useEffect(() => {
    const handleForceUnlike = () => {
      setLiked(false);
      setReload((r) => !r); // force le refetch de l'utilisateur
    };
    window.addEventListener("forceUnlike", handleForceUnlike);
    //console.log("Event listener for forceUnlike added");
    return () => window.removeEventListener("forceUnlike", handleForceUnlike);
  }, []);

  // Afficher un message de chargement si l'utilisateur n'est pas encore chargé
  if (!user) return <p>Chargement...</p>;

  // Fonction pour obtenir le genre préféré
  const getGenderSubcategory = (preferredGender: string) => {
    switch (preferredGender) {
      case "both":
        return <>Hommes et Femmes</>;
      case "homme":
        return <>Hommes</>;
      case "femme":
        return <>Femmes</>;
      default:
        return null;
    }
  };

  // Fonction pour liker ou unliker
  const handleLike = () => {
    if (liked) {
      unlikeUser();
    } else {
      likeUser();
    }
  };

  return (
    <div className="user-profile">
      <div className="user-profile-image">
        <img
          src={`${process.env.REACT_APP_API_URL}/${user.imageUrl}`}
          className="user-profile-image"
          alt="User Profile"
          onError={handleImageError}
        />
      </div>
      <h1>
        {user.firstname} {user.name}
      </h1>
      <div>
        <div className="divGender">
          <label htmlFor="genre">Genre :</label>
          <p>{user.userGender}</p>
        </div>
        <div className="divFavGender">
          <label htmlFor="preference">Préférence :</label>
          <p>{getGenderSubcategory(user.preferredGender)}</p>
        </div>
        <div className="divFavFood">
          <label htmlFor="nourriture_favorite">Nourriture favorite :</label>
          <p>{user.favoriteCategory}</p>
        </div>
        <div className="divAge">
          <label htmlFor="age">Age :</label>
          <p>{user.age} ans</p>
        </div>
        <div className="divJob">
          <label htmlFor="metier">Mêtier :</label>
          <p>{user.job || "Veuillez indiquer votre métier"}</p>
        </div>
        <div className="divPassions">
          <label htmlFor="passions">Passions :</label>
          <p>{user.passions || "Veuillez indiquer vos passions"}</p>
        </div>
      </div>
      <button className="like-button" onClick={handleLike}>
        {liked ? <GoHeartFill /> : <GoHeart />}
      </button>
    </div>
  );
};

export default UserProfile;
