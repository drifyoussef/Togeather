import React, { useEffect, useState } from "react";
import "./UserMessages.css";
import { useFetchUsers } from "../../hooks/useFetchUsers";
import { UserModel } from "../../models/User.model";
import { useNavigate, useParams } from "react-router-dom";
import io from "socket.io-client";

const socket = io(process.env.REACT_APP_API_URL);

export default function UserMessages() {
  
  const { id } = useParams();
  const { mutualMatches } = useFetchUsers();
  const navigate = useNavigate();
  //console.log(mutualMatches.map((user) => user), "ID of current user");
  // define console log of mutualMatches _id from the User.model.ts
  const connectedUserId = localStorage.getItem("userId");

  interface Message {
    _id: string;
    content: string;
    createdAt: string;
    sender: UserModel;
    receiver: UserModel;
  }

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [reload, setReload] = useState(false);


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

  //reload page when new message is sent
  useEffect(() => {
    if (reload) {
      fetchMessages()
        setReload(false);
        console.log(fetchMessages, 'fetchMessages');

    }
  },[reload]);


  useEffect(() => {

    const fetchUserMessages = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/messages/${id}`,
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

    
    fetchUserMessages();

    socket.on("receiveMessage", (message:any) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [id]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;

    //console.log(handleSendMessage, 'button clicked handleSendMessage');
    //console.log(newMessage, 'content of newMessage');

    const messageData = {
      content: newMessage,
      senderId: connectedUserId,
      sender: {_id: connectedUserId},
      receiverId: id,
    };

    console.log(messageData, 'content of messageData');

    console.log(connectedUserId, 'senderId (connectedUserId)');

    console.log(id, 'recieverId (id)');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(messageData),
      });

      if (response.ok) {
        const newMessageData = await response.json();
        socket.emit("sendMessage", newMessageData);
        setNewMessage("");

        // Display the message in the chat
        displayMessage(newMessageData);
      } else {
        console.error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleUserClick = (userId:any) => {
    navigate(`/messages/${userId}`);
  };

  const displayMessage = (messageData:any) => {
    const chat = document.querySelector('.chat');
    const messageContainer = document.createElement('div');
    const bubble = document.createElement('div');
    
    bubble.classList.add('bubble');
    
    if (messageData.senderId === connectedUserId) {
        messageContainer.classList.add('right');
    } else if (messageData.senderId === id) {
        messageContainer.classList.add('left');
    }
    
    bubble.textContent = `${messageData.senderId}: ${messageData.content}`;
    messageContainer.appendChild(bubble);
    if (chat) {
      chat.appendChild(messageContainer);
    }
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
        {messages
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
          .map((message) => {
            console.log(message, connectedUserId, "nfdjsnfdkjsnjsdnjkfndsj");
            return (
              <div
                key={message._id}
                className={`message ${message.sender._id === connectedUserId ? "right" : "left"}`}
              >
                <div className="avatar">{message.sender._id === connectedUserId ? "L" : "Y"}</div>
                <div className="bubble">
                  <p>{message.content}</p>
                  <span className="time">{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <div>{message.sender._id} et {connectedUserId} </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="bubble-type-div">
          <input
            className="input-send-message"
            type="text"
            placeholder="Ecrivez votre message ici..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button className="send-message" onClick={(e) => {handleSendMessage(); setReload(true)} }>Envoyer</button>
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