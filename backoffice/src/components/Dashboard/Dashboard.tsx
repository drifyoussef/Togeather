import { useEffect, useState } from 'react';
import './Dashboard.css';
import { useFetchUsers } from '../../hooks/useFetchUsers.tsx';


export default function Dashboard() {
  const { preferredGender, mutualMatches } = useFetchUsers();
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem("token");

useEffect(() => {
  console.log(users, preferredGender, mutualMatches, "TEST USEEFFECT");
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
});


  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2>Sidebar</h2>
        <ul>
          <li><a href="#overview">Overview</a></li>
          <li><a href="#reports">Reports</a></li>
          <li><a href="#settings">Settings</a></li>
        </ul>
      </aside>
      <div className="main-content">
        <h1>Dashboard</h1>
        <div className="charts-div">
        <div className="chart-container">
          <h2 className="header-stats">User Statistics</h2>
        </div>
        <div className="chart-container">
          <h2 className="header-stats">Subscription Statistics</h2>
        </div>
        </div>
      </div>
    </div>
  );
}