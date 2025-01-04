import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import { UserModel } from "../../models/User.model";
import { MdEdit } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import Swal from "sweetalert2";

const Profile: React.FC = () => {
  const [user, setUser] = useState<UserModel>();
  const [isEditing, setIsEditing] = useState<{ [key: string]: boolean }>({});
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
  const [updatedField, setUpdatedField] = useState<string | null>(null);
  const [reload, setReload] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const navigate = useNavigate();

  const connectedUserId = localStorage.getItem("currentUserId");

  //console.log(connectedUserId, "ID of current user");

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
          setImageUrl(data.imageUrl);
          console.log(data.imageUrl, "DATA IMAGE URL");
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
    const connectedUserId = localStorage.getItem("currentUserId");
    if (updatedField && connectedUserId && user) {
      const updatedData = {
        userId: connectedUserId,
        imageUrl: inputValues.imageUrl,
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
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
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
          console.error("Error updating user:", error);
        })
        .finally(() => {
          setUpdatedField(null);
          setReload(true);
        });
    }
  }, [updatedField, inputValues, user, connectedUserId]);

  const handleDeleteAccount = async () => {
    const token = localStorage.getItem("token");
    const connectedUserId = localStorage.getItem("currentUserId");
  
    if (!token || !connectedUserId) {
      console.error("User not authenticated");
      return;
    }
  
    try {
      const result = await Swal.fire({
        title: 'Êtes-vous sûr?',
        text: "Vous ne pourrez pas revenir en arrière!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Oui, supprimez-le!'
      });
  
      if (result.isConfirmed) {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${connectedUserId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
  
        const data = await response.json();
  
        if (data.message === 'User deleted successfully') {
          console.log('User deleted successfully, showing Swal...');
          console.log('navigating to /auth/login');
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: 'Votre compte a été supprimé avec succès',
          });
  
          localStorage.removeItem("token");
          localStorage.removeItem("currentUserId");
          navigate('/auth/login');
        } else {
          throw new Error("Failed to delete account");
        }
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      Swal.fire(
        'Erreur!',
        'Une erreur est survenue lors de la suppression de votre compte.',
        'error'
      );
    }
  };

  const toggleEdit = (field: string) => {
    if (user) {
      setIsEditing((prev) => ({ ...prev, [field]: !prev[field] }));
      if (field in user) {
        setInputValues((prev) => ({ ...prev, [field]: (user as any)[field] }));
      }
    }
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    setInputValues((prev) => ({ ...prev, [field]: event.target.value }));
    //console.log(`Donnée ${field} changée en: ${event.target.value}`);
  };

  const handleSave = (field: string) => {
    setUpdatedField(field);
    setIsEditing((prev) => ({ ...prev, [field]: false }));
    //console.log(`Nouvelle Donnée ${field} a la valeur: ${inputValues[field]}`);
  };

  const handleImageUpload = async (file: File) => {
    console.log("File :", file);
    if (!file) {
      console.error("No file selected");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const imageResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const result = await imageResponse.json();
      setImageUrl(result.imageUrl);
      // Update the user's imageUrl in the backend
      const token = localStorage.getItem("token");
      const updatedData = {
        userId: connectedUserId,
        imageUrl: result.imageUrl,
      };

      await fetch(`${process.env.REACT_APP_API_URL}/users/update`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      setUpdatedField("imageUrl");
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const handleEditClick = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        setImageFile(file); // Set image file
        handleImageUpload(file);
        const reader = new FileReader();
        reader.onload = (e: any) => {
          setImageUrl(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    };
    fileInput.click();
  };

  return (
    <div className="div-profile">
      <div className="profileCard">
        <div className="profileImage">
          {imageUrl ? (
            //console.log(imageUrl, "image url"),
            <div className="user-img-profile-container">
              <img src={`${process.env.REACT_APP_API_URL}/${imageUrl}`} alt="User" className="user-img-profile" />
              <div
                className="edit-button-container-profile"
                onClick={handleEditClick}
              >
                <FaEdit className="edit-button" />
              </div>
            </div>
          ) : (
            <div className="user-img-profile-container">
              <img
                src="https://www.w3schools.com/w3images/avatar2.png"
                alt="default-userimage"
                className="profileImageIcon"
              />
              <div
                className="edit-button-container-profile"
                onClick={handleEditClick}
              >
                <FaEdit className="edit-button" />
              </div>
            </div>
          )}
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
                    onChange={(e) => handleChange(e, "firstname")}
                    onBlur={() => handleSave("firstname")}
                  />
                ) : (
                  <div className="edit-data-content">
                    <p className="profile">{user.firstname}</p>
                    <MdEdit
                      className="editDataProfil"
                      onClick={() => toggleEdit("firstname")}
                    />
                  </div>
                )}
              </div>
              <div className="divName">
                <label>Nom :</label>
                {isEditing.name ? (
                  <input
                    type="text"
                    value={inputValues.name}
                    onChange={(e) => handleChange(e, "name")}
                    onBlur={() => handleSave("name")}
                  />
                ) : (
                  <div className="edit-data-content">
                    <p className="profile">{user.name}</p>
                    <MdEdit
                      className="editDataProfil"
                      onClick={() => toggleEdit("name")}
                    />
                  </div>
                )}
              </div>
              <div className="divMail">
                <label>Email :</label>
                {isEditing.email ? (
                  <input
                    type="text"
                    value={inputValues.email}
                    onChange={(e) => handleChange(e, "email")}
                    onBlur={() => handleSave("email")}
                  />
                ) : (
                  <div className="edit-data-content">
                    <p className="profile">{user.email}</p>
                    <MdEdit
                      className="editDataProfil"
                      onClick={() => toggleEdit("email")}
                    />
                  </div>
                )}
              </div>
              <div className="divGender">
                <label>Genre :</label>
                {isEditing.userGender ? (
                  <input
                    type="text"
                    value={inputValues.userGender}
                    onChange={(e) => handleChange(e, "userGender")}
                    onBlur={() => handleSave("userGender")}
                  />
                ) : (
                  <div className="edit-data-content">
                    <p className="profile">{user.userGender}</p>
                    <MdEdit
                      className="editDataProfil"
                      onClick={() => toggleEdit("userGender")}
                    />
                  </div>
                )}
              </div>
              <div className="divFavGender">
                <label>Préférence :</label>
                {isEditing.preferredGender ? (
                  <input
                    type="text"
                    value={inputValues.preferredGender}
                    onChange={(e) => handleChange(e, "preferredGender")}
                    onBlur={() => handleSave("preferredGender")}
                  />
                ) : (
                  <div className="edit-data-content">
                    <p className="profile">{user.preferredGender}</p>
                    <MdEdit
                      className="editDataProfil"
                      onClick={() => toggleEdit("preferredGender")}
                    />
                  </div>
                )}
              </div>
              <div className="divFavFood">
                <label>Nourriture favorite :</label>
                {isEditing.favoriteCategory ? (
                  <input
                    type="text"
                    value={inputValues.favoriteCategory}
                    onChange={(e) => handleChange(e, "favoriteCategory")}
                    onBlur={() => handleSave("favoriteCategory")}
                  />
                ) : (
                  <div className="edit-data-content">
                    <p className="profile">{user.favoriteCategory}</p>
                    <MdEdit
                      className="editDataProfil"
                      onClick={() => toggleEdit("favoriteCategory")}
                    />
                  </div>
                )}
              </div>
              <div className="divAge">
                <label>Age :</label>
                {isEditing.age ? (
                  <input
                    type="text"
                    value={inputValues.age}
                    onChange={(e) => handleChange(e, "age")}
                    onBlur={() => handleSave("age")}
                  />
                ) : (
                  <div className="edit-data-content">
                    <p className="profile">{user.age}</p>
                    <MdEdit
                      className="editDataProfil"
                      onClick={() => toggleEdit("age")}
                    />
                  </div>
                )}
              </div>
              <div className="divJob">
                <label>Mêtier :</label>
                {isEditing.job ? (
                  <input
                    type="text"
                    value={inputValues.job}
                    onChange={(e) => handleChange(e, "job")}
                    onBlur={() => handleSave("job")}
                  />
                ) : (
                  <div className="edit-data-content">
                    <p className="profile">{user.job}</p>
                    <MdEdit
                      className="editDataProfil"
                      onClick={() => toggleEdit("job")}
                    />
                  </div>
                )}
              </div>
              <div className="divPassions">
                <label>Passions :</label>
                {isEditing.passions ? (
                  <input
                    type="text"
                    value={inputValues.passions}
                    onChange={(e) => handleChange(e, "passions")}
                    onBlur={() => handleSave("passions")}
                  />
                ) : (
                  <div className="edit-data-content">
                    <p className="profile">{user.passions}</p>
                    <MdEdit
                      className="editDataProfil"
                      onClick={() => toggleEdit("passions")}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <h1>Chargement...</h1>
          )}
        </div>
      </div>
      <button className="delete-profil" onClick={handleDeleteAccount}>Supprimer votre compte</button>
    </div>
  );
};

export default Profile;
