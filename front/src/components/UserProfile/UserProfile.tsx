import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { GoHeart, GoHeartFill } from "react-icons/go";
import { UserModel } from '../../models/User.model';

import './UserProfile.css';

const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserModel | null>(null);
  const [liked, setLiked] = useState(false);
  const [reload, setReload] = useState(false);

  const likeUser = () => {
    const token = localStorage.getItem("token");
    console.log('token when like user', token);
    const currentUserId = localStorage.getItem("currentUserId");

    fetch(`${process.env.REACT_APP_API_URL}/auth/users/${id}/like`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ liked: true, currentUserId }),
    })
      .then((response) => response.json())
      .then((data) => {
        setLiked(true);
        setReload(true); // Trigger reload to refresh the state
      })
      .catch((error) => {
        console.error("Error liking user:", error);
      });
  };

  const unlikeUser = () => {
    const token = localStorage.getItem("token");
    console.log('token when unlike user', token);
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    const currentUserId = localStorage.getItem('currentUserId');
    console.log(currentUserId, 'currentUserId from UserProfile');
    if (id && currentUserId) {
      fetch(`${process.env.REACT_APP_API_URL}/auth/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'GET',
      })
        .then((response) => response.json())
        .then((data) => {
          setUser(data);
          setLiked(data.likedBy.includes(currentUserId));   // Explicitly set liked state

          if (data.message) {
            console.log(data.message);
          }
        })
        .catch((error) => {
          console.error('Error fetching user details:', error);
        });
    }
  }, [id, reload]); // Add reload as a dependency

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
    if (liked) {
      unlikeUser();
    } else {
      likeUser();
    }
  };

  return (
    <div className="user-profile">
      <div className='user-profile-image'><img src={`http://localhost:4000/${user.imageUrl}`} className='user-profile-image' alt="User Profile" /></div>
      <h1>{user.firstname} {user.name}</h1>
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
        {liked ? <GoHeartFill /> : <GoHeart />}
      </button>
    </div>
  );
};

export default UserProfile;