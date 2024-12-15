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
  const connectedUserId = localStorage.getItem("userId");
  const connectedFirstname = localStorage.getItem("firstname");

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
  const [selectedUser, setSelectedUser] = useState<UserModel | null>(null);

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

  useEffect(() => {
    if (reload) {
      fetchMessages();
      setReload(false);
    }
  }, [reload]);

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

    socket.on("receiveMessage", (message: any) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [id]);

  useEffect(() => {
    const selectedUserId = localStorage.getItem("selectedUserId");
    if (selectedUserId) {
      const user = mutualMatches.find((user) => user._id === selectedUserId);
      if (user) {
        setSelectedUser(user);
      }
    }
  }, [mutualMatches]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;

    const messageData = {
      content: newMessage,
      senderId: connectedUserId,
      sender: { _id: connectedUserId },
      receiverId: id,
    };

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
        displayMessage(newMessageData);
      } else {
        console.error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleUserClick = (user: UserModel) => {
    setSelectedUser(user);
    localStorage.setItem("selectedUserId", user._id);
    navigate(`/messages/${user._id}`);
  };

  const displayMessage = (messageData: any) => {
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

  const getLatestMessage = (userId: string) => {
    const userMessages = messages.filter(
      (message) =>
        (message.sender._id === userId && message.receiver._id === connectedUserId) ||
        (message.sender._id === connectedUserId && message.receiver._id === userId)
    );
    if (userMessages.length === 0) return { content: "", sender: null };
    const latestMessage = userMessages.reduce((latest, current) =>
      new Date(latest.createdAt) > new Date(current.createdAt) ? latest : current
    );
    return { content: latestMessage.content, sender: latestMessage.sender };
  };

  return (
    <div className="div-matches">
      <div className="box-match">
        {mutualMatches.map((user) => {
          const latestMessage = getLatestMessage(user._id);
          return (
            <div
              className={`match-box ${selectedUser && selectedUser._id === user._id ? "selected" : ""}`}
              key={user._id}
              onClick={() => handleUserClick(user)}
            >
              <div className="header-match-box">
                <div className="circle-match">{user.firstname.charAt(0)}</div>
                <div className="header-text">
                  <p>
                    {user.firstname}, {user.age} ans
                  </p>
                  <p>{user.job}</p>
                </div>
                
              </div>
              <p className="latest-message">
                  {latestMessage.sender ? `${latestMessage.sender.firstname}: ${latestMessage.content}` : ""}
                </p>
            </div>
          );
        })}
      </div>
      <div className="messages">
        {selectedUser && (
          <div className="header-messages">
            <div className="circle-match">{selectedUser.firstname.charAt(0)}</div>
            <p className="header-conversation">
              Conversation avec {selectedUser.firstname}
            </p>
          </div>
        )}
        <div className="chat-container">
          {messages
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            .map((message) => (
              <div
                key={message._id}
                className={`message ${message.sender._id === connectedUserId ? "right" : "left"}`}
              >
                <div className="avatar">{message.sender._id === connectedUserId ? (connectedFirstname ? connectedFirstname.charAt(0) : "U") : (selectedUser ? selectedUser.firstname.charAt(0) : "U")}</div>
                <div className="bubble">
                  <p className="user-message">{message.content}</p>
                  <span className="time">Message de {message.sender.firstname} à {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
        </div>
        <div className="bubble-type-div">
          <input
            className="input-send-message"
            type="text"
            placeholder="Ecrivez votre message ici..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button className="send-message" onClick={(e) => { handleSendMessage(); setReload(true) }}>Envoyer</button>
        </div>
      </div>
      {selectedUser && (
        <div className="profile-match">
          <div className="header-profile-match">
            <div className="header-match-profile">
            <img className="profile-picture" src={selectedUser.imageUrl} alt={`${selectedUser.firstname} ${selectedUser.name}`} />
              <div className="header-text-profile">
                <p>{selectedUser.firstname} {selectedUser.name}, {selectedUser.age} ans</p>
                <p>Catégorie de nourriture préferée : {selectedUser.favoriteCategory}</p>
              </div>
            </div>
            <p className="profile-bio"></p>
          </div>
        </div>
      )}
    </div>
  );
}