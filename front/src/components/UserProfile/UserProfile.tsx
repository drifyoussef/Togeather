import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { UserModel } from '../../models/User.model';
import './UserProfile.css';

const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserModel | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (id) {
      console.log(`Fetching user with ID: ${id}`);
      fetch(`${process.env.REACT_APP_API_URL}/auth/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'GET',
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message) {
            console.error(data.message);
          } else {
            setUser(data);
          }
        })
        .catch((error) => {
          console.error('Error fetching user details:', error);
        });
    }
  }, [id]);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="user-profile">
      <h1>{user.firstname} {user.name}</h1>
      <img src={user.image || "https://architecture.ou.edu/wp-content/uploads/2018/07/ANGELAPERSON-1447-300x300.jpg"} alt="User profile" />
      <div>
              <div className="divGender">
                <label>Genre :</label>
                <p>{user.userGender}</p>
              </div>
              <div className="divFavGender">
                <label> :</label>
                <p>{user.preferredGender}</p>
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
    </div>
  );
};

export default UserProfile;
