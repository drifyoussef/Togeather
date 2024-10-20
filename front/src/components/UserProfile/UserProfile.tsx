import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaHeart } from "react-icons/fa";
import { UserModel } from '../../models/User.model';
import './UserProfile.css';

const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserModel | null>(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (id) {
      fetch(`${process.env.REACT_APP_API_URL}/auth/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'GET',
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data, "DATA USER LOG");
          setUser(data);
            setLiked(data.liked || false);
          if (data.message) {
            console.log(data.message);
          } else {
            
          }
        })
        .catch((error) => {
          console.error('Error fetching user details:', error);
        });
    }
  }, [id]);


  useEffect(() => {
    console.log('Rendering with liked state:', liked);
  }, [liked]);

  if (!user) return <p>Chargement...</p>;

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

  const handleLike = () => {
    const token = localStorage.getItem("token");

    if (user) {
        fetch(`${process.env.REACT_APP_API_URL}/auth/users/${user._id}/like`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ liked: !liked }),
        })
            .then((response) => {
                if (!response.ok) {
                    return response.json().then((error) => {
                        throw new Error(error.message || 'Unknown error occurred');
                    });
                }
                return response.json();
            })
            .then((data) => {
                console.log("User liked status updated successfully:", data);
                setLiked((prevLiked) => !prevLiked);
            })
            .catch((error) => {
                console.error("Error liking user:", error);
                alert('Failed to update like status. Please try again later.');
            });
    }
};

  return (
    <div className="user-profile">
      <h1>
        {user.firstname} {user.name}
      </h1>
      <img
        src={
          user.image ||
          "https://architecture.ou.edu/wp-content/uploads/2018/07/ANGELAPERSON-1447-300x300.jpg"
        }
        alt="User profile"
      />
      <div>
        <div className="divGender">
          <label>Genre :</label>
          <p>{user.userGender}</p>
        </div>
        <div className="divFavGender">
          <label>Préférence :</label>
          <p>{getGenderSubcategory(user.preferredGender)}</p>
        </div>
        <div className="divFavFood">
          <label>Nourriture favorite :</label>
          <p>{user.favoriteCategory}</p>
        </div>
        <div className="divAge">
          <label>Age :</label>
          <p>{user.age} ans</p>
        </div>
        <div className="divJob">
          <label>Mêtier :</label>
          <p>{user.job || "Veuillez indiquer votre métier"}</p>
        </div>
        <div className="divPassions">
          <label>Passions :</label>
          <p>{user.passions || "Veuillez indiquer vos passions"}</p>
        </div>
      </div>
      <button className="like-button" onClick={handleLike}>
        <FaHeart
          className={`icon-heart-profile ${liked ? 'liked' : 'not-liked'}`}
        />
      </button>
    </div>
  );
};

export default UserProfile;
