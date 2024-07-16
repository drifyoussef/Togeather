import React, { useEffect, useState } from "react";
import "./Profile.css";
import { UserModel } from "../../models/User.model";
import { PiUserCirclePlusFill } from "react-icons/pi";

const Profile: React.FC = () => {
  const [user, setUser] = useState<UserModel>();
  const [inputValue, setInputValue] = useState("");

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

  const handleChange = (event: any) => {
    setInputValue(event.target.value);
  };

  return (
    <div className="div-profile">
      <div className="profileCard">
        <div className="profileImage"><PiUserCirclePlusFill className="profileImageIcon"/></div>
        <div className="profileInfo">
          {user ? (
            <div>
              <p className="profile">
                {user.firstname} {user.name}
              </p>
              <p>
                {user.email}
              </p>
            </div>
          ) : (
            <h1>Loading...</h1>
          )}
          <p>Web Developer</p>
        </div>
      </div>
      <div className="profileInfosModification">
        <p>Modifiez votre mail</p>
        <input
          type="text"
          placeholder={"Modifiez votre mail ici..."}
          value={inputValue}
          onChange={handleChange}
        />
      </div>
      <div className="profileInfosModification">
        <p>Modifiez votre métier</p>
        <input
          type="text"
          placeholder={"Modifiez votre métier ici..."}
          value={inputValue}
          onChange={handleChange}
        />
      </div>
      <button className="change-settings" onClick={changeSettings}>
        Modifier les informations
      </button>
    </div>
  );
};

export default Profile;
