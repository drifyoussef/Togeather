import React, { useEffect, useState } from "react";
import "./Profile.css";
import { UserModel } from "../../models/User.model";
import { PiUserCirclePlusFill } from "react-icons/pi";

const Profile: React.FC = () => {
  const [user, setUser] = useState<UserModel>();
  const [inputValue, setInputValue] = useState("");
  const [isJobEditing, setIsJobEditing] = useState(false);
  const [isPassionsEditing, setIsPassionsEditing] = useState(false);

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

  const changeSettings = () => {
    alert("Change settings clicked");
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    setInputValue(event.target.value);
    if (field === "job") {
      console.log(isJobEditing);
      setIsJobEditing(true);
    } else if (field === "passions") {
      console.log(isPassionsEditing);
      setIsPassionsEditing(true);
    }
  };

  return (
    <div className="div-profile">
      <div className="profileCard">
        <div className="profileImage">
          <PiUserCirclePlusFill className="profileImageIcon" />
        </div>
        <div className="profileInfo">
          {user ? (
            <div>
              <div className="divFirstname">
                <label>Prénom :</label>
                <p className="profile">{user.firstname}</p>
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
                <label>Votre genre :</label>
                <p>{user.userGender}</p>
              </div>
              <div className="divFavGender">
                <label>Vous preferez les :</label>
                <p>{user.preferredGender}</p>
              </div>
              <div className="divFavFood">
                <label>Votre nourriture favorite :</label>
                <p>{user.favoriteCategory}</p>
              </div>
              <div className="divAge">
                <label>Votre age :</label>
                <p>{user.age} ans</p>
              </div>
              <div className="divJob">
                <label>Votre mêtier :</label>
                <p>{user.job || "Veuillez indiquer votre métier"}</p>
              </div>
              <div className="divPassions">
                <label>Vos passions :</label>
                <p>{user.passions || "Veuillez indiquer vos passions"}</p>
              </div>
            </div>
          ) : (
            <h1>Chargement...</h1>
          )}
        </div>
      </div>
      <div className="profileInfosModification">
        <p>Modifiez votre mail</p>
        <input
          type="text"
          placeholder="Modifiez votre mail ici..."
          value={inputValue}
          onChange={(e) => handleChange(e, "email")}
        />
      </div>
      <div className="profileInfosModification">
        <p>Modifiez votre métier</p>
        <input
          type="text"
          placeholder="Modifiez votre métier ici..."
          value={inputValue}
          onChange={(e) => handleChange(e, "job")}
        />
      </div>
      <div className="profileInfosModification">
        <p>Modifiez vos passions</p>
        <input
          type="text"
          placeholder="Modifiez vos passions ici..."
          value={inputValue}
          onChange={(e) => handleChange(e, "passions")}
        />
      </div>
      <button className="change-settings" onClick={changeSettings}>
        Modifier les informations
      </button>
    </div>
  );
};

export default Profile;
