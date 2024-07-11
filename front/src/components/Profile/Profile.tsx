import React, { useEffect, useState } from "react";
import "./Profile.css";
import { UserModel } from "../../models/User.model";

const Profile: React.FC = () => {
  const [user, setUser] = useState<UserModel>();

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${process.env.REACT_APP_API_URL}/auth/user`, {
      headers: {
        "Authorization":`Bearer ${token}`
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

  return (
    <div className="div-profile">
      <div className="profileCard">
        <div className="profileImage"></div>
        <div className="profileInfo">
          {user ? (
            <h1>
              {user.firstname} {user.name}
            </h1>
          ) : (
            <h1>Loading...</h1>
          )}
          <p>Web Developer</p>
          <button onClick={changeSettings}>Change Settings</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
