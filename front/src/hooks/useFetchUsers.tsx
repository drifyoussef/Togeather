import { useState, useEffect } from "react";
import { UserModel } from "../models/User.model";

export const useFetchUsers = () => {
  const [users, setUsers] = useState<UserModel[]>([]);
  const [preferredGender, setPreferredGender] = useState<string | null>(null);
  const [filteredUsers, setFilteredUsers] = useState<UserModel[]>([]);
  const [mutualMatches, setMutualMatches] = useState<UserModel[]>([]); 

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("Token not found");
      localStorage.setItem("showSwal", "true");
      window.location.href = '/auth/login';
      return;
    }

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
  }, []);

  useEffect(() => {
    if (preferredGender && users.length > 0) {
      let filtered: UserModel[] = [];

      if (preferredGender === "both") {
        filtered = users;
      } else {
        filtered = users.filter((user) => user.userGender === preferredGender);
      }

      setFilteredUsers(filtered);
      const mutualMatches = filtered.filter((user) => user.isMutual); // Assuming isMutual is sent from the backend
      setMutualMatches(mutualMatches); // Set the mutual matches
    }
  }, [preferredGender, users]);

  return { users, preferredGender, mutualMatches, filteredUsers };
};
