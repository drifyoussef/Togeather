import React, { useEffect, useState } from "react";
import "./Profile.css";
import { UserModel } from "../../models/User.model";
import { PiUserCirclePlusFill } from "react-icons/pi";
import { MdEdit } from "react-icons/md";

const Profile: React.FC = () => {
  const [user, setUser] = useState<UserModel>();
  const [isEditing, setIsEditing] = useState<{ [key: string]: boolean }>({});
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
  const [updatedField, setUpdatedField] = useState<string | null>(null);

  const connectedUserId = localStorage.getItem("userId");

  console.log(connectedUserId, "ID of current user");

  //A FAIRE L'EDIT D'INFORMATIONS NON RENTREES

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${process.env.REACT_APP_API_URL}/auth/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: "GET",
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
        console.error("Error fetching user:", error);
      });
  }, []);


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (updatedField && user) {
      // Send updated data to the backend
      fetch(`${process.env.REACT_APP_API_URL}/users/update`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: connectedUserId, [updatedField]: inputValues[updatedField] }),
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
          console.error('Error updating user:', error);
        })
        .finally(() => {
          setUpdatedField(null);
        });
    }
  }, [updatedField, inputValues, user, connectedUserId]);

  const toggleEdit = (field: string) => {
    if (user) {
      setIsEditing((prev) => ({ ...prev, [field]: !prev[field] }));
      if (field in user) {
        setInputValues((prev) => ({ ...prev, [field]: (user as any)[field] }));
      }
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setInputValues((prev) => ({ ...prev, [field]: event.target.value }));
    console.log(`Donnée ${field} changée en: ${event.target.value}`);
  };

  const handleSave = (field: string) => {
    setUpdatedField(field);
    setIsEditing((prev) => ({ ...prev, [field]: false }));
    console.log(`Nouvelle Donnée ${field} a la valeur: ${inputValues[field]}`);
  };

  return (
    <div className="div-profile">
      <div className="profileCard">
        <div className="profileImage">
          <PiUserCirclePlusFill className="profileImageIcon" />
        </div>
        <div className="profileInfo">
          {user ? (
            <div className="div-informations-container">
              <div className="divFirstname">
                <label>Prénom :</label>
                {isEditing.firstname ? (
                  <input
                    type="text"
                    value={inputValues.firstname}
                    onChange={(e) => handleChange(e, 'firstname')}
                    onBlur={() => handleSave('firstname')}
                  />
                ) : (
                  <div className="edit-data-content">
                  <p className="profile">
                    {user.firstname}
                  </p>
                  <MdEdit className="editDataProfil" onClick={() => toggleEdit('firstname')} />
                  </div>
                )}
              </div>
              <div className="divName">
                <label>Nom :</label>
                <p>{user.name}</p>
              </div>
              <div className="divMail">
                <label>Adresse mail :</label>
                <p>{user.email}</p>
              </div>
              <div className="divGender">
                <label>Genre :</label>
                <p>{user.userGender}</p>
              </div>
              <div className="divFavGender">
                <label>Préférence :</label>
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
          ) : (
            <h1>Chargement...</h1>
          )}
        </div>
      </div>
     { /* Faire fonction pour supprimer le compte (dans controller et front).*/}
      <button className="delete-profil">
        Supprimer votre compte
      </button>
    </div>
  );
};

export default Profile;
