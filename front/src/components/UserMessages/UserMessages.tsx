import React, { useEffect, useState } from "react";
import "./UserMessages.css";
import { useFetchUsers } from "../../hooks/useFetchUsers";
import { UserModel } from "../../models/User.model";
import { useNavigate, useParams } from "react-router-dom";
import io from "socket.io-client";

const socket = io(process.env.REACT_APP_API_URL);

export default function UserMessages() {
  // Récupérer l'ID de l'utilisateur
  const { id } = useParams();
  // Récupérer les matchs mutuels
  const { mutualMatches } = useFetchUsers();
  const navigate = useNavigate();
  // Récupérer l'ID de l'utilisateur connecté
  const connectedUserId = localStorage.getItem("currentUserId");
  // Récupérer le prénom de l'utilisateur connecté
  const connectedFirstname = localStorage.getItem("firstname");

  console.log(connectedUserId, "CONNECTED USER ID FROM USERMESSAGES");
  console.log(connectedFirstname, "CONNECTED FIRSTNAME FROM USERMESSAGES");

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
  // Charger le nouveau message (state par défaut: "")
  const [newMessage, setNewMessage] = useState("");
  // Charger le rechargement (state par défaut: false)
  const [reload, setReload] = useState(false);
  // Charger l'utilisateur sélectionné (state par défaut: null)
  const [selectedUser, setSelectedUser] = useState<UserModel | null>(null);
  // Charger la visibilité du chat (state par défaut: false pour le responsive mobile)
  const [isChatVisible, setIsChatVisible] = useState(false);

  console.log(messages, "MESSAGES");

  // Fonction pour récupérer les messages globaux
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

  // Utiliser le hook useEffect pour charger les messages
  useEffect(() => {
    if (reload) {
      fetchMessages();
      setReload(false);
    }
  }, [reload]);

  // Utiliser le hook useEffect pour charger les messages par id
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

    // Charger les messages de l'utilisateur²
    fetchUserMessages();

    // WebSocket pour recevoir les messages
    socket.on("receiveMessage", (message: any) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Nettoyer le socket
    return () => {
      socket.off("receiveMessage");
    };
  }, [id]);

  // Utiliser le hook useEffect pour charger l'utilisateur sélectionné
  useEffect(() => {
    const selectedUserId = localStorage.getItem("selectedUserId");
    if (selectedUserId && mutualMatches) {
      const user = mutualMatches.find((user) => user._id === selectedUserId);
      if (user) {
        setSelectedUser(user);
      }
    }
  }, [mutualMatches]);

  // Fonction pour envoyer un message
  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;

    // Données du message
    const messageData = {
      content: newMessage,
      senderId: connectedUserId,
      sender: { _id: connectedUserId },
      receiverId: id,
    };

    try {
      // Envoi du message à l'API
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

  // Fonction pour gérer le clic sur un utilisateur
  const handleUserClick = (user: UserModel) => {
    setSelectedUser(user);
    localStorage.setItem("selectedUserId", user._id);
    navigate(`/messages/${user._id}`);
    setIsChatVisible(true); // Show chat-container on user click
    console.log(setIsChatVisible, "SETISCHATVISIBLE");
  };

  // Fonction pour afficher un message
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

  // Fonction pour récupérer le dernier message
  const getLatestMessage = (userId: string) => {
    if (!connectedUserId) {
      console.error("connectedUserId is null or undefined");
      return { content: "", sender: null };
    }
   
    // Filtrer les messages de l'utilisateur
    const userMessages = messages.filter(
      (message) =>
        (message.sender && message.sender._id === userId && message.receiver && message.receiver._id === connectedUserId) ||
        (message.sender && message.sender._id === connectedUserId && message.receiver && message.receiver._id === userId)
    );
  
    // Si aucun message n'est trouvé
    if (userMessages.length === 0) return { content: "", sender: null };
  
    // Trouver le dernier message
    const latestMessage = userMessages.reduce((latest, current) =>
      new Date(latest.createdAt) > new Date(current.createdAt) ? latest : current
    );
  
    // Retourner le dernier message
    return { content: latestMessage.content, sender: latestMessage.sender };
  };

  return (
    <div className="div-matches">
      <div className={`box-match ${isChatVisible ? "hidden" : ""}`}>
        {mutualMatches.map((user) => {
          const latestMessage = getLatestMessage(user._id);
          return (
            <div
              className={`match-box ${selectedUser && selectedUser._id === user._id ? "selected" : ""}`}
              key={user._id}
              onClick={() => handleUserClick(user)}
            >
              <div className="header-match-box">
              {selectedUser && (
                <img className="profile-picture" src={`${process.env.REACT_APP_API_URL}/${selectedUser.imageUrl}`} alt={`${selectedUser.firstname} ${selectedUser.name}`} />
              )}
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
      {isChatVisible && (
        <div className="messages">
          {selectedUser && (
            <div className="header-messages">
              <img className="profile-picture" src={`${process.env.REACT_APP_API_URL}/${selectedUser.imageUrl}`} alt={`${selectedUser.firstname} ${selectedUser.name}`} />
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
                  className={`message ${message.sender && message.sender._id === connectedUserId ? "right" : "left"}`}
                >
                  <div className="avatar">{message.sender && message.sender._id === connectedUserId ? (connectedFirstname ? connectedFirstname.charAt(0) : "U") : (selectedUser ? selectedUser.firstname.charAt(0) : "U")}</div>
                  <div className="bubble">
                    <p className="user-message">{message.content}</p>
                    <span className="time">Message de {message.sender && message.sender.firstname} à {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
      )}
    </div>
  );
}