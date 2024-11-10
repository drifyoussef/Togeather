import React, { useEffect, useState } from "react";
import "./Messages.css";
import { useFetchUsers } from "../../hooks/useFetchUsers";
import { UserModel } from "../../models/User.model";

export default function Messages() {
  const { mutualMatches } = useFetchUsers();
  // define console log of mutualMatches _id from the User.model.ts
  console.log(mutualMatches.map((user) => user._id));
  interface Message {
    _id: string;
    content: string;
    createdAt: string;
    sender: UserModel;
    receiver: UserModel;
  }

  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
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
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, []);

  return (
    <div className="div-matches">
      <div className="box-match">
        {mutualMatches.map((user) => (
          <div className="match-box" key={user._id}>
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