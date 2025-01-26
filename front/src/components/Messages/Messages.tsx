import React, { useEffect, useState } from "react";
import "./Messages.css";
import { useFetchUsers } from "../../hooks/useFetchUsers";
import { UserModel } from "../../models/User.model";
import { useNavigate } from "react-router-dom";

export default function Messages() {
  // Récupérer les matchs mutuels
  const { mutualMatches } = useFetchUsers();
  const navigate = useNavigate();
  //console.log(mutualMatches.map((user) => user._id));
  // Définir le type Message
  interface Message {
    _id: string;
    content: string;
    createdAt: string;
    sender: UserModel;
    receiver: UserModel;
  }

  // Charger les messages (state par défaut tableau vide: [])
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    //API call pour récupérer les messages
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/messages`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        // Extraire les données JSON
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, []);

  // Gérer le clic sur un utilisateur
  const handleUserClick = (userId:any) => {
    navigate(`/messages/${userId}`);
  };

  return (
    <div className="div-matches">
      <div className="box-match">
        {mutualMatches.map((user) => (
          <div className="match-box" key={user._id} onClick={() => handleUserClick(user._id)}>
            <div className="header-match-box">
              <div className="circle-match">{user.firstname.charAt(0)}</div>
              <div className="header-text">
                <p>
                  {user.firstname}, {user.age} ans
                </p>
                <p>{user.job}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="messages">
        {mutualMatches.map((user) => (
          <div className="header-messages">
            <div className="circle-match">{user.firstname.charAt(0)}</div>
            <p className="header-conversation">
              Conversation avec {user.firstname}
            </p>
          </div>
        ))}
        <div className="chat-container">
          {messages.map((message: any) => (
            <div
              className={`message ${message.isMe ? "right" : "left"}`}
              key={message._id}
            >
              <div className="avatar">{message.isMe ? "L" : "Y"}</div>
              <div className="bubble">
                <p>{message.content}</p>
                <span className="time">{message.time}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="bubble-type-div">
          <input
            className="input-send-message"
            type="text"
            placeholder="Ecrivez votre message ici..."
          />
          <button className="send-message">Envoyer</button>
        </div>
      </div>
      {mutualMatches.map((user) => (
      <div className="profile-match">
        <div className="header-profile-match">
          <div className="header-match-profile">
            <div className="profile-picture">{user.image}</div>
            <div className="header-text-profile">
              <p>{user.firstname} {user.name}, {user.age} ans</p>
              <p>Catégorie de nourriture préferée : {user.favoriteCategory}</p>
            </div>
          </div>
          <p className="profile-bio"></p>
        </div>
      </div>
      ))}
    </div>
  );
}