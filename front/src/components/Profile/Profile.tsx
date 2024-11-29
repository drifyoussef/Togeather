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
  const [reload, setReload] = useState(false);

  const connectedUserId = localStorage.getItem("userId");

  console.log(connectedUserId, "ID of current user");

  useEffect(() => {
    if (reload) {
      fetchUserData();
      setReload(false);
    }
  }, [reload]);

  const fetchUserData = () => {
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
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (updatedField && user) {
      const updatedData = {
        userId: connectedUserId,
        firstname: inputValues.firstname,
        name: inputValues.name,
        email: inputValues.email,
        userGender: inputValues.userGender,
        preferredGender: inputValues.preferredGender,
        favoriteCategory: inputValues.favoriteCategory,
        age: inputValues.age,
        job: inputValues.job,
        passions: inputValues.passions,
      };

      fetch(`${process.env.REACT_APP_API_URL}/users/update`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
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
          setReload(true);
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
                {isEditing.name ? (
                  <input
                    type="text"
                    value={inputValues.name}
                    onChange={(e) => handleChange(e, 'name')}
                    onBlur={() => handleSave('name')}
                  />
                ) : (
                  <div className="edit-data-content">
                    <p className="profile">
                      {user.name}
                    </p>
                    <MdEdit className="editDataProfil" onClick={() => toggleEdit('name')} />
                  </div>
                )}
              </div>
              <div className="divMail">
                <label>Email :</label>
                {isEditing.email ? (
                  <input
                    type="text"
                    value={inputValues.email}
                    onChange={(e) => handleChange(e, 'email')}
                    onBlur={() => handleSave('email')}
                  />
                ) : (
                  <div className="edit-data-content">
                    <p className="profile">
                      {user.email}
                    </p>
                    <MdEdit className="editDataProfil" onClick={() => toggleEdit('email')} />
                  </div>
                )}
              </div>
              <div className="divGender">
                <label>Genre :</label>
                {isEditing.userGender ? (
                  <input
                    type="text"
                    value={inputValues.userGender}
                    onChange={(e) => handleChange(e, 'userGender')}
                    onBlur={() => handleSave('userGender')}
                  />
                ) : (
                  <div className="edit-data-content">
                    <p className="profile">
                      {user.userGender}
                    </p>
                    <MdEdit className="editDataProfil" onClick={() => toggleEdit('userGender')} />
                  </div>
                )}
              </div>
              <div className="divFavGender">
                <label>Préférence :</label>
                {isEditing.preferredGender ? (
                  <input
                    type="text"
                    value={inputValues.preferredGender}
                    onChange={(e) => handleChange(e, 'preferredGender')}
                    onBlur={() => handleSave('preferredGender')}
                  />
                ) : (
                  <div className="edit-data-content">
                    <p className="profile">
                      {user.preferredGender}
                    </p>
                    <MdEdit className="editDataProfil" onClick={() => toggleEdit('preferredGender')} />
                  </div>
                )}
              </div>
              <div className="divFavFood">
                <label>Nourriture favorite :</label>
                {isEditing.favoriteCategory ? (
                  <input
                    type="text"
                    value={inputValues.favoriteCategory}
                    onChange={(e) => handleChange(e, 'favoriteCategory')}
                    onBlur={() => handleSave('favoriteCategory')}
                  />
                ) : (
                  <div className="edit-data-content">
                    <p className="profile">
                      {user.favoriteCategory}
                    </p>
                    <MdEdit className="editDataProfil" onClick={() => toggleEdit('favoriteCategory')} />
                  </div>
                )}
              </div>
              <div className="divAge">
                <label>Age :</label>
                {isEditing.age ? (
                  <input
                    type="text"
                    value={inputValues.age}
                    onChange={(e) => handleChange(e, 'age')}
                    onBlur={() => handleSave('age')}
                  />
                ) : (
                  <div className="edit-data-content">
                    <p className="profile">
                      {user.age}
                    </p>
                    <MdEdit className="editDataProfil" onClick={() => toggleEdit('age')} />
                  </div>
                )}
              </div>
              <div className="divJob">
                <label>Mêtier :</label>
                {isEditing.job ? (
                  <input
                    type="text"
                    value={inputValues.job}
                    onChange={(e) => handleChange(e, 'job')}
                    onBlur={() => handleSave('job')}
                  />
                ) : (
                  <div className="edit-data-content">
                    <p className="profile">
                      {user.job}
                    </p>
                    <MdEdit className="editDataProfil" onClick={() => toggleEdit('job')} />
                  </div>
                )}
              </div>
              <div className="divPassions">
                <label>Passions :</label>
                {isEditing.passions ? (
                  <input
                    type="text"
                    value={inputValues.passions}
                    onChange={(e) => handleChange(e, 'passions')}
                    onBlur={() => handleSave('passions')}
                  />
                ) : (
                  <div className="edit-data-content">
                    <p className="profile">
                      {user.passions}
                    </p>
                    <MdEdit className="editDataProfil" onClick={() => toggleEdit('passions')} />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <h1>Chargement...</h1>
          )}
        </div>
      </div>
      <button className="delete-profil">
        Supprimer votre compte
      </button>
    </div>
  );
};

export default Profile;