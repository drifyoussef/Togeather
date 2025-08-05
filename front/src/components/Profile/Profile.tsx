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

  // Recharger les données utilisateur après modification
  useEffect(() => {
    if (reload) {
      fetchUserData();
      setReload(false);
    }
  }, [reload]);

  // Récupérer les données utilisateur
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
          //console.log(data.imageUrl, "DATA IMAGE URL");
        }
      })
      .catch((error) => {
        //Erreur lors de la récupération des données utilisateur
        console.error("Error fetching user:", error);
      });
  };

  // Récupérer les données utilisateur lors du chargement du composant
  useEffect(() => {
    fetchUserData();
  }, []);

  // Mettre à jour les données utilisateur
  useEffect(() => {
    // Token de l'utilisateur connecté
    const token = localStorage.getItem("token");
    // ID de l'utilisateur connecté
    const connectedUserId = localStorage.getItem("currentUserId");
    // Si un champ a été mis à jour et que l'utilisateur est connecté
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

      // Mettre à jour les données utilisateur
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
          // Recharger les données utilisateur
          setUpdatedField(null);
          setReload(true);
        });
    }
  }, [updatedField, inputValues, user, connectedUserId]);

  // Supprimer le compte utilisateur
  const handleDeleteAccount = async () => {
    const token = localStorage.getItem("token");
    const connectedUserId = localStorage.getItem("currentUserId");
  
    // Vérifier si l'utilisateur est connecté
    if (!token || !connectedUserId) {
      console.error("User not authenticated");
      return;
    }
  
    // Demander une confirmation avant de supprimer le compte
    try {
      const result = await Swal.fire({
        title: 'Êtes-vous sûr de vouloir supprimer votre compte?',
        text: "Vous ne pourrez pas revenir en arrière!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Oui, supprimez-le!',
        cancelButtonText: 'Annuler',
        confirmButtonColor: "#AD0051",
        cancelButtonColor: "#AD0051",
      });
  
      // Si l'utilisateur confirme la suppression du compte, lancer la requête de suppression
      if (result.isConfirmed) {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${connectedUserId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
  
        // Vérifier si la suppression du compte a réussi
        const data = await response.json();
  
        // Si la suppression du compte a réussi, afficher une alerte de succès
        if (data.message === 'User deleted successfully') {
          //console.log('User deleted successfully, showing Swal...');
          //console.log('navigating to /auth/login');
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: 'Votre compte a été supprimé avec succès',
          });
  
          // Supprimer le token et l'ID de l'utilisateur connecté du localStorage
          localStorage.removeItem("token");
          localStorage.removeItem("currentUserId");
          // Rediriger l'utilisateur vers la page de connexion
          navigate('/auth/login');
        } else {
          throw new Error("Failed to delete account");
        }
      }
    } catch (error) {
      // Erreur lors de la suppression du compte
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

  // Changer l'image de l'utilisateur
  const handleImageUpload = async (file: File) => {
    //console.log("File :", file);
    if (!file) {
      console.error("No file selected");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const imageResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/api/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const result = await imageResponse.json();
      setImageUrl(result.imageUrl);
      // Mettre à jour l'image de l'utilisateur dans la base de données
      const token = localStorage.getItem("token");
      const updatedData = {
        userId: connectedUserId,
        imageUrl: result.imageUrl,
      };

      // Mettre à jour les données utilisateur
      await fetch(`${process.env.REACT_APP_API_URL}/users/update`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      // Mettre à jour le champ "imageUrl" dans la base de données
      setUpdatedField("imageUrl");
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  // Gérer le clic sur le bouton d'édition de l'image
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
              <img src={`${process.env.REACT_APP_API_URL}/api/uploads/${imageUrl}`} alt="User" className="user-img-profile" />
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
                <label htmlFor="prenom">Prénom :</label>
                {isEditing.firstname ? (
                  <input
                    type="text"
                    id="prenom"
                    name="prenom"
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
                <label htmlFor="nom">Nom :</label>
                {isEditing.name ? (
                  <input
                    type="text"
                    id="nom"
                    name="nom"
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
                <label htmlFor="email">Email :</label>
                {isEditing.email ? (
                  <input
                    type="text"
                    id="email"
                    name="email"
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
                <label htmlFor="genre">Genre :</label>
                {isEditing.userGender ? (
                  <input
                    type="text"
                    id="genre"
                    name="genre"
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
                <label htmlFor="preference">Préférence :</label>
                {isEditing.preferredGender ? (
                  <input
                    type="text"
                    id="preference"
                    name="preference"
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
                <label htmlFor="nourriture_favorite">Nourriture favorite :</label>
                {isEditing.favoriteCategory ? (
                  <input
                    type="text"
                    id="nourriture_favorite"
                    name="nourriture_favorite"
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
                <label htmlFor="age">Age :</label>
                {isEditing.age ? (
                  <input
                    type="text"
                    id="age"
                    name="age"
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
                <label htmlFor="metier">Mêtier :</label>
                {isEditing.job ? (
                  <input
                    type="text"
                    id="metier"
                    name="metier"
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
                <label htmlFor="passions">Passions :</label>
                {isEditing.passions ? (
                  <input
                    type="text"
                    id="passions"
                    name="passions"
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
