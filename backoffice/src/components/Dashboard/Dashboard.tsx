import { useEffect, useState } from "react";
import { DataGrid, GridRenderCellParams } from "@mui/x-data-grid";
import "./Dashboard.css";
import { useFetchUsers } from "../../hooks/useFetchUsers.tsx";
import { redirect } from "react-router-dom";

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
    isBanned: boolean;
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
      redirect("/auth/admin/login");
    }
  }, [token, preferredGender, mutualMatches]);
  

  const toggleBan = (userId: string, isBanned: boolean) => {
    console.log(`User ${userId} is now ${isBanned ? "banned" : "unbanned"}`);
    const token = localStorage.getItem("token");
  
    fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/auth/users/ban`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: userId, isBanned }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(() => {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId ? { ...user, isBanned } : user
          )
        );
      })
      .catch((error) => {
        console.error(`Error ${isBanned ? "banning" : "unbanning"} user:`, error);
      });
  };

  const columns = [
    { field: "name", headerName: "Nom", width: 150 },
    { field: "firstname", headerName: "Prénom", width: 150 },
    { field: "userGender", headerName: "Genre", width: 150 },
    { field: "age", headerName: "Age", width: 100 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "job", headerName: "Métier", width: 150 },
    { field: "favoriteCategory", headerName: "Nourriture favorite", width: 200 },
    { field: "passions", headerName: "Passions", width: 200 },
    {
      field: "isBanned",
      headerName: "Bannir/Débannir",
      width: 100,
      renderCell: (params: GridRenderCellParams<User>) => (
        <button
          className="ban-button"
          onClick={() => toggleBan(params.row._id, !params.row.isBanned)}
        >
          {params.row.isBanned ? "Débannir" : "Bannir"}
        </button>
      ),
    }
  ];


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
              <p className="user-length">Nombre d'utilisateurs : {users.length}</p>
              <div style={{ height: 500, width: 950 }}>
              <DataGrid 
                rows={users.map((user, index) => ({ id: index + 1, ...user }))} 
                columns={columns} 
                pageSizeOptions={[5, 10]} 
                pagination 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
