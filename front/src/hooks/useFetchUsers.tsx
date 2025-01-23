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
  // Naviguer vers une autre page
  const navigate = useNavigate();

  useEffect(() => {
    // Récupérer le token et l'ID de l'utilisateur actuel
    const token = localStorage.getItem("token");
    console.log(token, 'token from useFetchUsers');
    const currentUserId = localStorage.getItem("currentUserId");
    console.log(currentUserId, 'currentUserId from useFetchUsers');

    // Récupérer le chemin actuel
    const currentPath = window.location.pathname;

    //console.log("Current Path:", currentPath);
    //console.log("Token:", token);

    // Si le token n'est pas trouvé et que le chemin actuel n'est pas '/auth/login' ou '/auth/register' ou '/connection' ou '/confirm-email' alors afficher une erreur
    if (!token && currentPath !== '/auth/login' && currentPath !== '/auth/register' && currentPath !== '/connection' && currentPath !== '/confirm-email') {
      console.error("Token not found");
      localStorage.setItem("showSwal", "true");
      navigate('/connection'); // V2 changement de redirection vers la bonne page
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

  return { users, preferredGender, mutualMatches, filteredUsers };
};
