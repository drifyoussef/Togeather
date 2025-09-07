import React, { useEffect, useState } from "react";
import "./UserMessages.css";
import { useFetchUsers } from "../../hooks/useFetchUsers";
import { UserModel } from "../../models/User.model";
import { useNavigate, useParams } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import { IoArrowBack } from "react-icons/io5";
import io from "socket.io-client";
import Swal from "sweetalert2";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { useImageFallback } from "../../hooks/useImageFallback";

// Configuration Socket.io avec debugging explicite
// Utilise la même URL que l'API, Socket.io sera sur /socket.io/
const socketUrl = process.env.REACT_APP_API_URL || "http://localhost:4000";
console.log("🔍 Tentative de connexion Socket à:", socketUrl);

// Correction : path doit être '/socket.io' pour https://togeather.fr/api si Nginx redirige /socket.io/
const socket = io(socketUrl, {
  withCredentials: true,
  autoConnect: true,
  transports: ['polling', 'websocket'],
  forceNew: true,
  path: '/socket.io' // IMPORTANT : correspond à l'URL proxy Nginx
});
console.log("🔌 Socket configuré pour:", socketUrl);

// Logs détaillés pour debugging
socket.on("connect", () => {
  console.log("✅ Socket connecté avec succès, ID:", socket.id);
  console.log("🔗 Transport utilisé:", socket.io.engine.transport.name);
});

socket.on("disconnect", (reason) => {
  console.log("❌ Socket déconnecté, raison:", reason);
});

socket.on("connect_error", (error) => {
  console.error("🚫 Erreur de connexion Socket:", error);
  console.error("🔍 Message d'erreur:", error.message);
});

export default function UserMessages() {
  // Récupérer l'ID de l'utilisateur
  const { id } = useParams();
  // Récupérer les matchs mutuels
  const { mutualMatches } = useFetchUsers();
  const navigate = useNavigate();
  // Récupérer l'ID de l'utilisateur connecté
  const connectedUserId = localStorage.getItem("currentUserId");
  // Récupérer le prénom de l'utilisateur connecté
  //const connectedFirstname = localStorage.getItem("firstname");

  //console.log(connectedUserId, "CONNECTED USER ID FROM USERMESSAGES");
  //console.log(connectedFirstname, "CONNECTED FIRSTNAME FROM USERMESSAGES");

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
  // Charger le message survolé (state par défaut: null)
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);
  // Détecter si on est sur mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // State local pour les matchs affichés
  const [displayedMatches, setDisplayedMatches] = useState<UserModel[]>([]);
  //etat chargement des messages
  const [isFetchingMessages, setIsisFetchingMessages] = useState(true);

  const { handleImageError } = useImageFallback();

  // Synchronise displayedMatches avec mutualMatches
  useEffect(() => {
    setDisplayedMatches(mutualMatches);
  }, [mutualMatches]);

  // Gérer le redimensionnement pour détecter mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    // Connexion manuelle au socket
    socket.connect();
    
    // S'identifier auprès du serveur socket
    if (connectedUserId) {
      console.log("🔌 Connexion socket pour utilisateur:", connectedUserId);
      socket.emit("join", connectedUserId);
    }

    const fetchUserMessages = async () => {
      setIsisFetchingMessages(true);
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
        
        // CORRECTION 1: Filtrer les messages pour cette conversation seulement
        const filteredMessages = data.filter((message: Message) =>
          (message.sender && message.sender._id === id && 
           message.receiver && message.receiver._id === connectedUserId) ||
          (message.sender && message.sender._id === connectedUserId && 
           message.receiver && message.receiver._id === id)
        );
        setMessages(filteredMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setIsisFetchingMessages(false);
      }
    };

    // Charger les messages de l'utilisateur
    fetchUserMessages();

    // CORRECTION 2: WebSocket pour recevoir les messages avec filtrage
    socket.on("receiveMessage", (message: any) => {
      console.log("🔔 Message reçu via socket:", message);
      console.log("👥 Pour conversation entre:", connectedUserId, "et", id);
      
      // Vérifier que le message appartient à la conversation active
      const isForCurrentConversation = 
        (message.sender && message.sender._id === id && 
         message.receiver && message.receiver._id === connectedUserId) ||
        (message.sender && message.sender._id === connectedUserId && 
         message.receiver && message.receiver._id === id);
      
      if (isForCurrentConversation) {
        console.log("✅ Message ajouté à la conversation:", message.content);
        setMessages((prevMessages) => [...prevMessages, message]);
      } else {
        console.log("❌ Message ignoré car pas pour cette conversation");
        console.log("   Sender:", message.sender?._id, "Receiver:", message.receiver?._id);
      }
    });

    // Nettoyer le socket
    return () => {
      socket.off("receiveMessage");
    };
  }, [id, connectedUserId]); // CORRECTION 3: Ajouter connectedUserId aux dépendances

  // Utiliser le hook useEffect pour charger l'utilisateur sélectionné
  useEffect(() => {
    const selectedUserId = localStorage.getItem("selectedUserId");
    if (selectedUserId && mutualMatches) {
      const user = mutualMatches.find((user) => user._id === selectedUserId);
      //console.log("selectedUserId :", selectedUserId);
      //console.log("selectedUser :", user?.firstname);
      if (user) {
        setSelectedUser(user);
      }
    }
  }, [mutualMatches]);

  // Fonction pour envoyer un message
  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;

    const messageData = {
      content: newMessage,
      senderId: connectedUserId,
      sender: { _id: connectedUserId },
      receiverId: id,
      receiver: { _id: id }, // CORRECTION 4: Ajouter le receiver
    };

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(messageData),
        }
      );

      if (response.ok) {
        const sentMessage = await response.json();
        
        // CORRECTION 7: S'assurer que le sender est bien défini avec l'ID correct
        const messageToAdd = {
          ...sentMessage,
          sender: { _id: connectedUserId },
          receiver: { _id: id }
        };
        
        // CORRECTION 5: Ajouter immédiatement le message envoyé avec les bonnes infos
        setMessages((prevMessages) => [...prevMessages, messageToAdd]);
        
        // CORRECTION 6: Émettre le message via socket pour le destinataire
        console.log("📤 Émission du message via socket:", messageToAdd);
        console.log("👤 Vers utilisateur:", id);
        socket.emit("sendMessage", messageToAdd);
        
        setNewMessage("");
        // Supprimer setReload(true) car on met à jour directement
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
    //console.log(setIsChatVisible, "SETISCHATVISIBLE");
  };

  // Fonction pour revenir à la liste des matches (mobile)
  const handleBackToMatches = () => {
    setIsChatVisible(false);
    // Ne pas réinitialiser selectedUser ni supprimer selectedUserId
    // L'utilisateur reste sélectionné visuellement dans la liste
    // navigate vers /messages avec l'ID pour garder l'URL cohérente
    if (selectedUser) {
      navigate(`/messages/${selectedUser._id}`);
    } else {
      navigate('/messages');
    }
  };

  useEffect(() => {
    const isMobile = window.innerWidth <= 768; // adapte le breakpoint si besoin
    if (id) {
      if (!isMobile) {
        setIsChatVisible(true); // Desktop : ouvre direct la conversation
      } else {
        setIsChatVisible(false); // Mobile : affiche d'abord la box-match
      }
    }
  }, [id]);

  // Fonction pour récupérer le dernier message
  const getLatestMessage = (userId: string) => {
    if (!connectedUserId) {
      console.error("connectedUserId is null or undefined");
      return { content: "", sender: null };
    }

    // Filtrer les messages de l'utilisateur
    const userMessages = messages.filter(
      (message) =>
        (message.sender &&
          message.sender._id === userId &&
          message.receiver &&
          message.receiver._id === connectedUserId) ||
        (message.sender &&
          message.sender._id === connectedUserId &&
          message.receiver &&
          message.receiver._id === userId)
    );

    // Si aucun message n'est trouvé
    if (userMessages.length === 0) return { content: "", sender: null };

    // Trouver le dernier message
    const latestMessage = userMessages.reduce((latest, current) =>
      new Date(latest.createdAt) > new Date(current.createdAt)
        ? latest
        : current
    );

    // Retourner le dernier message
    return { content: latestMessage.content, sender: latestMessage.sender };
  };

  const handleDeleteConversation = async (userId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/conversations/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          method: "DELETE",
        }
      );
      if (response.ok) {
        // Mets à jour la liste des matchs affichés (retire le match supprimé)
        setDisplayedMatches((prev) =>
          prev.filter((user) => user._id !== userId)
        );
        // Met à jour le state des matchs mutuels
        setSelectedUser(null);
        // Met à jour le state des matchs mutuels
        setIsChatVisible(false);
        localStorage.removeItem("selectedUserId");
        // Met à jour les matchs mutuels
        //console.log(setDisplayedMatches, "UPDATED MATCHES AFTER DELETION");
        // Mets à jour les messages (retire ceux liés à ce user)
        setMessages((prev) =>
          prev.filter(
            (msg) =>
              !(
                (msg.sender && msg.sender._id === userId) ||
                (msg.receiver && msg.receiver._id === userId)
              )
          )
        );
        // Si la conversation était ouverte, ferme-la
        if (selectedUser && selectedUser._id === userId) {
          setSelectedUser(null);
          setIsChatVisible(false);
          localStorage.removeItem("selectedUserId");
        }
        // Eventuel event pour UserProfile
        if (window.location.pathname === `/profile/${userId}`) {
          window.dispatchEvent(new CustomEvent("forceUnlike"));
        }
      } else {
        console.error("Erreur lors de la suppression de la conversation");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de la conversation:", error);
    }
  };

  const handleReportMessage = async (messageId: string) => {
    //console.log("Reporting message with ID:", messageId);
    const { value: reason } = await Swal.fire({
      title: "Signaler ce message",
      input: "text",
      inputLabel: "Raison du signalement",
      inputPlaceholder: "Décrivez la raison...",
      showCancelButton: true,
      confirmButtonText: "Envoyer",
      cancelButtonText: "Annuler",
      icon: "warning",
      confirmButtonColor: "#AD0051",
      cancelButtonColor: "#333",
      inputAttributes: {
        style: "width: auto; margin-top: 16px;",
      },
    });

    if (reason) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/messages/${messageId}/report`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ reason }),
          }
        );
        if (response.ok) {
          Swal.fire({
            title: "Signalement envoyé",
            text: "Merci, le message a été signalé aux administrateurs du site.",
            icon: "success",
            confirmButtonColor: "#AD0051",
          });
        } else {
          Swal.fire({
            title: "Erreur",
            text: "Impossible d'envoyer le signalement.",
            icon: "error",
            confirmButtonColor: "#AD0051",
          });
        }
      } catch (error) {
        Swal.fire({
          title: "Erreur",
          text: "Une erreur est survenue.",
          icon: "error",
          confirmButtonColor: "#AD0051",
        });
      }
    }
  };

  useEffect(() => {
  // Lance le timer seulement si displayedMatches est vide
  if (displayedMatches.length === 0) {
    const timer = setTimeout(() => {
      // Vérifie à nouveau après 1000ms (ou plus si besoin)
      if (displayedMatches.length === 0) {
        Swal.fire({
          icon: "info",
          title: "Aucun match à afficher",
          text: "Vous allez être redirigé vers l'accueil.",
          confirmButtonColor: "#AD0051",
          confirmButtonText: "OK",
        }).then(() => {
          navigate("/");
        });
      }
    }, 1000); // 1000ms d'attente, ajuste si besoin

    // Nettoyage du timer si le composant se démonte ou si displayedMatches change
    return () => clearTimeout(timer);
  }
}, [displayedMatches, navigate]);

  return (
    <div className="div-matches">
      <div className={`box-match ${isChatVisible ? "hidden" : ""}`}>
        {displayedMatches.map((user) => {
          const latestMessage = getLatestMessage(user._id);
          return (
            <div
              className={`match-box ${
                selectedUser && selectedUser._id === user._id ? "selected" : ""
              }`}
              key={user._id}
              onClick={() => handleUserClick(user)}
            >
              <div className="header-match-box">
                <img
                  className="profile-picture"
                  src={`${process.env.REACT_APP_API_URL}/${user.imageUrl}`}
                  alt={`${user.firstname} ${user.name}`}
                  onError={handleImageError}
                />
                <div className="header-text">
                  <p className="match-name">{user.firstname}</p>
                  <p className="latest-message">
  {latestMessage.sender ? (
    latestMessage.sender._id === connectedUserId ? (
      // Si c'est l'utilisateur connecté qui a envoyé
      <>
        <strong>Vous :</strong>{" "}
        {latestMessage.content.length > 10
          ? `${latestMessage.content.slice(0, 15)}...`
          : latestMessage.content}
      </>
    ) : (
      // Sinon, c'est le match qui a envoyé
      <>
        <strong>{user.firstname} :</strong>{" "}
        {latestMessage.content.length > 10
          ? `${latestMessage.content.slice(0, 15)}...`
          : latestMessage.content}
      </>
    )
  ) : (
    "Nouveau match !"
  )}
</p>
                </div>
              </div>
              <div
                className="delete-message"
                onClick={async (e) => {
                  e.stopPropagation();
                  const result = await Swal.fire({
                    title: "Supprimer la conversation",
                    text: "Êtes-vous sûr de vouloir supprimer cette conversation ? Cette action effacera tous les messages et votre match. Cette action est irréversible.",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#AD0051",
                    cancelButtonColor: "#333",
                    confirmButtonText: "Oui, supprimer",
                    cancelButtonText: "Annuler",
                  });
                  if (result.isConfirmed) {
                    try {
                      await handleDeleteConversation(user._id);
                      Swal.fire({
                        title: "Conversation supprimée",
                        text: "La conversation a été supprimée avec succès.",
                        icon: "success",
                        confirmButtonColor: "#AD0051",
                      });
                    } catch (error) {
                      Swal.fire({
                        title: "Erreur",
                        text: "La suppression a échoué. Veuillez réessayer.",
                        icon: "error",
                        confirmButtonColor: "#AD0051",
                      });
                    }
                  }
                }}
              >
                <MdDelete className="delete-message-icon" />
              </div>
            </div>
          );
        })}
      </div>
      {isChatVisible && (
        <div className="messages">
          {selectedUser && (
            <div className="header-messages">
              {isMobile && (
                <IoArrowBack 
                  className="back-arrow" 
                  onClick={handleBackToMatches}
                  size={24}
                />
              )}
              <div className="header-user">
                <img
                  className="profile-picture"
                  src={`${process.env.REACT_APP_API_URL}/${selectedUser.imageUrl}`}
                  alt={`${selectedUser.firstname} ${selectedUser.name}`}
                  onError={handleImageError}
                />
                <p className="header-conversation">
                  Conversation avec {selectedUser.firstname}
                </p>
              </div>
            </div>
          )}
          <div className="chat-container">
            {isFetchingMessages ? (
              <div className="no-messages">
                <p>Chargement des messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="no-messages">
                <IoChatbubbleEllipsesOutline size={48} color="#AD0051" />
                <p>Aucun message pour le moment</p>
                <p>
                  Commencez la conversation en envoyant votre premier message à{" "}
                  {selectedUser?.firstname}!
                </p>
              </div>
            ) : (
              messages
                .sort(
                  (a, b) =>
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime()
                )
                .map((message, index) => {
                  // Debug pour identifier le problème
                  //console.log(`Message ${index}: "${message.content}" - Sender: ${message.sender?._id} - Connected: ${connectedUserId} - Position: ${message.sender && message.sender._id === connectedUserId ? "right" : "left"}`);
                  
                  return (
                  <div
                    key={`${message._id}-${index}`}
                    className={`message ${
                      message.sender && message.sender._id === connectedUserId
                        ? "right"
                        : "left"
                    }`}
                    onMouseEnter={() => setHoveredMessage(message._id)}
                    onMouseLeave={() => setHoveredMessage(null)}
                  >
                    {!(
                      message.sender && message.sender._id === connectedUserId
                    ) && (
                      <div className="avatar">
                        {selectedUser ? selectedUser.firstname.charAt(0) : "U"}
                      </div>
                    )}
                    <div>
                      <div className="bubble">
                        <p className="user-message">{message.content}</p>
                        {hoveredMessage === message._id &&
                          message.sender &&
                          message.sender._id !== connectedUserId && (
                            <button
                              className="report-btn"
                              onClick={() => handleReportMessage(message._id)}
                            >
                              Signaler
                            </button>
                          )}
                      </div>
                      <span
                        className={`time ${
                          message.sender &&
                          message.sender._id === connectedUserId
                            ? "time-right"
                            : "time-left"
                        }`}
                      >
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                  );
                })
            )}
          </div>
          <div className="bubble-type-div">
            <input
              className="input-send-message"
              type="text"
              placeholder="Ecrivez votre message ici..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage();
                  // Supprimer setReload(true) car mise à jour directe
                }
              }}
            />
            <button
              className="send-message"
              onClick={(e) => {
                handleSendMessage();
                // Supprimer setReload(true) car mise à jour directe
              }}
            >
              Envoyer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}