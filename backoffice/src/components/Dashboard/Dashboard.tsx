import { useEffect, useState } from "react";
import "./Dashboard.css";
import { useFetchUsers } from "../../hooks/useFetchUsers.tsx";

export default function Dashboard() {
  const { preferredGender, mutualMatches } = useFetchUsers();
  interface User {
    _id: string;
    name: string;
    firstname: string;
    email: string;
    job: string;
    age: number;
    length: number;
    passions: string;
    favoriteCategory: string;
    userGender: string;
  }

  const [users, setUsers] = useState<User[]>([]);
  const token = localStorage.getItem("token");

  console.log(users.length, "TEST USERS");

  useEffect(() => {
    console.log(users, preferredGender, mutualMatches, "TEST USEEFFECT");
    if (token) {
      fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/auth/users`, {
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
    } else {
      console.error("No token found in localStorage");
    }
  }, [token, preferredGender, mutualMatches]);

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2>Sidebar</h2>
        <ul>
          <li>
            <a href="#overview">Overview</a>
          </li>
          <li>
            <a href="#reports">Reports</a>
          </li>
          <li>
            <a href="#settings">Settings</a>
          </li>
        </ul>
      </aside>
      <div className="main-content">
        <h1>Dashboard</h1>
        <div className="charts-div">
          <div className="chart-container">
            <h2 className="header-stats">Données des utilisateurs</h2>
            <ul>
              <p>Nombre d'utilisateurs : {users.length}</p>
              {users.map((user) => (
                <div>
                  <li className="user-data-list" key={user._id}>
                    <ul className="user-list">
                      <p className="p-bold">Nom, Prénom :</p> {user.name} {user.firstname}
                    </ul>
                    <ul className="user-list"><p className="p-bold">Age :</p> {user.age}</ul>
                    <ul className="user-list"><p className="p-bold">Email :</p>{user.email}</ul>
                    <ul className="user-list"><p className="p-bold">Métier :</p>{user.job}</ul>
                    <ul className="user-list"><p className="p-bold">Passions :</p>{user.passions}</ul>
                    <ul className="user-list"><p className="p-bold">Genre :</p>{user.userGender}</ul>
                    <ul className="user-list"><p className="p-bold">Nourriture favorite :</p>{user.favoriteCategory}</ul>
                  </li>
                </div>
              ))}
            </ul>
          </div>
          <div className="chart-container">
            <h2 className="header-stats">Données abonnement premium</h2>
          </div>
        </div>
      </div>
    </div>
  );
}
