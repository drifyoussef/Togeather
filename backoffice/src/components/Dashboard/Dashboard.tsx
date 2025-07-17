import { useEffect, useState } from "react";
import { DataGrid, GridRenderCellParams } from "@mui/x-data-grid";
import "./Dashboard.css";
import { useFetchUsers } from "../../hooks/useFetchUsers.tsx";
import { redirect } from "react-router-dom";
import Swal from "sweetalert2";

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
    banReason: string;
    banEnd: Date;
  }

  interface ReportItem {
    reason: string;
    reportedBy?: { firstname?: string; lastname?: string; name?: string };
    reportedAt?: string;
  }

  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState([]);
  const token = localStorage.getItem("token");

  console.log(users.length, "TEST USERS");
  console.log(reports, "TEST REPORTS");

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

  const toggleBan = (
    userId: string,
    isBanned: boolean,
    banReason: string,
    banEnd: Date
  ) => {
    console.log(`User ${userId} is now ${isBanned ? "banned" : "unbanned"}`);
    const token = localStorage.getItem("token");

    fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/auth/users/ban`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: userId, isBanned, banReason, banEnd }),
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
        console.error(
          `Error ${isBanned ? "banning" : "unbanning"} user:`,
          error
        );
      });
  };

  useEffect(() => {
    console.log(reports, "reports data");
    if (token) {
      fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/messages/reports`, {
        headers: { Authorization: `Bearer ${token}` },
        method: "GET",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message) {
            console.error(data.message);
          } else {
            setReports(data);
          }
        })
        .catch((error) => {
          console.error("Erreur lors du fetch des reports :", error);
        });
    } else {
      console.error("No token found in localStorage");
      redirect("/auth/admin/login");
    }
  }, [token]);

  const columns = [
    { field: "name", headerName: "Nom", width: 150 },
    { field: "firstname", headerName: "Prénom", width: 150 },
    { field: "userGender", headerName: "Genre", width: 150 },
    { field: "age", headerName: "Age", width: 100 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "job", headerName: "Métier", width: 150 },
    {
      field: "favoriteCategory",
      headerName: "Nourriture favorite",
      width: 200,
    },
    { field: "passions", headerName: "Passions", width: 200 },
    {
      field: "isBanned",
      headerName: "Bannir/Débannir",
      width: 100,
      renderCell: (params: GridRenderCellParams<User>) => (
        <button
          className="ban-button"
          onClick={() => {
            Swal.fire({
              title: `Voulez-vous ${
                params.row.isBanned ? "débannir" : "bannir"
              } ${params.row.firstname} ?`,
              html: !params.row.isBanned
                ? `
              <label for="banReason">Raison du bannissement :</label>
              <input id="banReason" class="swal2-input" placeholder="Entrez la raison du bannissement">
              <label for="banEnd">Date de fin du bannissement :</label>
              <input id="banEnd" type="datetime-local" class="swal2-input">
            `
                : "",
              showCancelButton: true,
              confirmButtonText: "Oui",
              cancelButtonText: "Non",
              preConfirm: () => {
                if (!params.row.isBanned) {
                  const banReason = (
                    document.getElementById("banReason") as HTMLInputElement
                  )?.value;
                  const banEnd = (
                    document.getElementById("banEnd") as HTMLInputElement
                  )?.value;

                  if (!banReason || !banEnd) {
                    Swal.showValidationMessage(
                      "Veuillez remplir tous les champs !"
                    );
                    return null;
                  }

                  // Convertit la date locale en ISO (UTC)
                  const banEndDate = new Date(banEnd);
                  // Pour la France, pas besoin de forcer le fuseau, new Date(banEnd) prend la locale du navigateur
                  const banEndISO = banEndDate.toISOString();

                  return { banReason, banEnd: banEndISO };
                }
                return {};
              },
            }).then((result) => {
              if (result.isConfirmed) {
                const { banReason, banEnd } = result.value || {};
                toggleBan(
                  params.row._id,
                  !params.row.isBanned,
                  banReason,
                  banEnd
                );
                Swal.fire(
                  `${params.row.firstname} a été ${
                    params.row.isBanned ? "débanni" : "banni"
                  } !`
                );
              }
            });
          }}
        >
          {params.row.isBanned ? "Débannir" : "Bannir"}
        </button>
      ),
    },
  ];

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2>Togeather</h2>
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
            <p className="user-length">
              Nombre d'utilisateurs : {users.length}
            </p>
            <div style={{ height: 500, width: 950 }}>
              <DataGrid
                rows={users.map((user, index) => ({ id: index + 1, ...user }))}
                columns={columns}
                pageSizeOptions={[5, 10]}
                pagination
              />
            </div>
          </div>
          <div id="reports">
            <h2>Messages signalés: {reports.length}</h2>
            <table>
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Message signalé</th>
                  <th>Raisons du signalement</th>
                  <th>Date du premier signalement</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(
                  (msg: {
                    _id: string;
                    sender?: {
                      firstname?: string;
                      lastname?: string;
                      name?: string;
                    };
                    content: string;
                    reports?: ReportItem[];
                  }) => (
                    <tr key={msg._id}>
                      <td>
                        {msg.sender
                          ? `${msg.sender.firstname || ""} ${
                              msg.sender.lastname || msg.sender.name || ""
                            }`
                          : "Utilisateur inconnu"}
                      </td>
                      <td>{msg.content}</td>
                      <td>
                        <ul
                          style={{
                            paddingLeft: 0,
                            margin: 0,
                            listStyle: "none",
                          }}
                        >
                          {msg.reports?.map((r: ReportItem, i: number) => (
                            <li key={i}>
                              {r.reportedBy
                                ? `${r.reportedBy.firstname || ""} ${
                                    r.reportedBy.lastname ||
                                    r.reportedBy.name ||
                                    ""
                                  }`
                                : "Inconnu"}
                                {" à signalé "} {msg.sender
                          ? `${msg.sender.firstname || ""} ${
                              msg.sender.lastname || msg.sender.name || ""
                            }`
                          : "Utilisateur inconnu"}
                          <br />
                          {" pour la raison suivante : "}
                          <br />
                              <b>{r.reason}</b>
                              <p>
                                {r.reportedAt
                                  ? new Date(r.reportedAt).toLocaleString()
                                  : ""}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td>
                        {msg.reports?.[0]?.reportedAt &&
                          new Date(msg.reports[0].reportedAt).toLocaleString()}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
