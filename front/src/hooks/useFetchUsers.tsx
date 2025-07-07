import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserModel } from "../models/User.model";

export const useFetchUsers = () => {
  // Recupérer les utilisateurs
  const [users, setUsers] = useState<UserModel[]>([]);
  // Recupérer le genre préféré
  const [preferredGender, setPreferredGender] = useState<string | null>(null);
  // Filtrer les utilisateurs
  const [filteredUsers, setFilteredUsers] = useState<UserModel[]>([]);
  // Recupérer les likes mutuels (les utilisateurs qui ont matché)
  const [mutualMatches, setMutualMatches] = useState<UserModel[]>([]);
  const [currentUser, setCurrentUser] = useState<UserModel | null>(null);
  // Naviguer vers une autre page
  const navigate = useNavigate();

  useEffect(() => {
    // Récupérer le token et l'ID de l'utilisateur actuel
    const token = localStorage.getItem("token");
    //console.log(token, 'token from useFetchUsers');
    //const currentUserId = localStorage.getItem("currentUserId");
    //console.log(currentUserId, 'currentUserId from useFetchUsers');

    // Récupérer le chemin actuel
    const currentPath = window.location.pathname;

    //console.log("Current Path:", currentPath);
    //console.log("Token:", token);

    // Si le token n'est pas trouvé et que le chemin actuel n'est pas autorisé
    if (!token && currentPath !== '/auth/login' && currentPath !== '/auth/register' && currentPath !== '/connection' && currentPath !== '/confirm-email') {
      console.error("Token not found");
      localStorage.setItem("showSwal", "true");

      // Vérifier si l'utilisateur est banni avant de rediriger
      fetch(`${process.env.REACT_APP_API_URL}/auth/user`, {
        headers: { Authorization: `Bearer ${token}` },
        method: "GET",
      })
        .then((response) => {
          if (response.status === 403) {
            console.error("User is banned");
            navigate('/banned'); // Rediriger vers la page bannie
          } else {
            navigate('/connection'); // Rediriger vers la page de connexion
          }
        })
        .catch((error) => {
          console.error("Error fetching user:", error);
          navigate('/connection'); // Rediriger vers la page de connexion en cas d'erreur
        });

      return;
    }

    // Route de l'API pour récupérer l'utilisateur actuel
    fetch(`${process.env.REACT_APP_API_URL}/auth/user`, {
      headers: { Authorization: `Bearer ${token}` },
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          console.error(data.message);
        } else {
          setPreferredGender(data.preferredGender);
          setCurrentUser(data);
        }
      })
      .catch((error) => {
        console.error("Error fetching user:", error);
      });

    // Route de l'API pour récupérer tous les utilisateurs
    fetch(`${process.env.REACT_APP_API_URL}/auth/users`, {
      headers: { Authorization: `Bearer ${token}` },
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          console.error(data.message);
        } else {
          setUsers(data);
        }
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  }, [navigate]);


// Filtrer les utilisateurs en fonction du genre préféré
  useEffect(() => {
    if (preferredGender && users.length > 0) {
      let filtered: UserModel[] = [];

      // Si le genre préféré est 'both' alors afficher tous les utilisateurs
      if (preferredGender === "both") {
        filtered = users;
      } else {
        // Sinon, afficher uniquement les utilisateurs qui ont le même genre préféré (homme ou femme)
        filtered = users.filter((user) => user.userGender === preferredGender);
      }

      // Mettre à jour les utilisateurs filtrés
      setFilteredUsers(filtered);
      // Mettre à jour les utilisateurs qui ont matché
      const mutualMatches = filtered.filter((user) => user.isMutual);
      // Mettre à jour les utilisateurs qui ont matché
      setMutualMatches(mutualMatches);
    }
  }, [preferredGender, users]);

  useEffect(() => {
  if (currentUser && users.length > 0) {
    // Filtrer les utilisateurs qui sont dans mutualMatches du currentUser
    const mutualMatches = users.filter((user) =>
      currentUser.mutualMatches?.includes(user._id)
    );
    setMutualMatches(mutualMatches);

    // Filtrage par genre préféré (optionnel)
    let filtered: UserModel[] = [];
    if (currentUser.preferredGender === "both") {
      filtered = users;
    } else {
      filtered = users.filter(
        (user) => user.userGender === currentUser.preferredGender
      );
    }
    setFilteredUsers(filtered);
  }
}, [currentUser, users]);

  return { users, preferredGender, mutualMatches, filteredUsers };
};
