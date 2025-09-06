import { useEffect, useState } from "react";
import { DataGrid, GridRenderCellParams } from "@mui/x-data-grid";
import "./Dashboard.css";
import useFetchUsers from "../../hooks/useFetchUsers";
import { useNavigate } from "react-router-dom";
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
    _id: number;
    sender?: { _id?: string; firstname?: string; lastname?: string; name?: string; email?: string };
    reason: string;
    reportedBy?: { firstname?: string; lastname?: string; name?: string };
    reportedAt?: string;
    content?: string;
    reports?: ReportItem[];
  }

  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    if (token) {
      fetch(`${import.meta.env.VITE_API_URL}/auth/users`, {
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
      localStorage.removeItem('adminToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('isAdmin');
      navigate("/auth/admin/login");
    }
  }, [token, preferredGender, mutualMatches, navigate]);

  const toggleBan = (
    userId: string,
    isBanned: boolean,
    banReason: string,
    banEnd: Date
  ) => {
    const token = localStorage.getItem("adminToken");
    fetch(`${import.meta.env.VITE_API_URL}/auth/users/ban`, {
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
        Swal.fire({
          title: "Erreur !",
          text: `Impossible de ${isBanned ? "bannir" : "débannir"} l'utilisateur.`,
          icon: "error"
        });
      });
  };

  useEffect(() => {
    if (token) {
      fetch(`${import.meta.env.VITE_API_URL}/messages/reports`, {
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
      localStorage.removeItem('adminToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('isAdmin');
      navigate("/auth/admin/login");
    }
  }, [token, navigate]);

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
      renderCell: (params: GridRenderCellParams<User>) => {
        // Filtrer les messages signalés de cet utilisateur
        const userReports = reports.filter(
          (msg: ReportItem) => msg.sender && msg.sender._id === params.row._id
        );

        // Créer une liste de toutes les raisons de reports (avec le message associé)
        const reportReasons: { label: string; value: string }[] = [];
        userReports.forEach((msg: ReportItem) => {
          msg.reports?.forEach((r: ReportItem) => {
            reportReasons.push({
              label: `${msg.content ? `"${msg.content}"` : ""} - ${r.reason}`,
              value: r.reason,
            });
          });
        });

        return (
          <button
            className="ban-button"
            onClick={async () => {
              await Swal.fire({
                title: `Voulez-vous ${
                  params.row.isBanned ? "débannir" : "bannir"
                } ${params.row.firstname} ?`,
                icon: params.row.isBanned ? "info" : "warning",
                html: !params.row.isBanned
                  ? `
                  <label for="banReason">Raison du bannissement :</label>
                  <div class="my-swal-input-container">
                    <input id="banReason" class="my-swal-input" placeholder="Entrez la raison du bannissement" style="flex:1;" autocomplete="off">
                    <select id="banReasonSelect" class="my-swal-input" style="flex:1;">
                      <option value="">Sélectionner la raison du bannissement</option>
                      ${reportReasons
                        .map(
                          (r) =>
                            `<option value="${r.value.replace(/"/g, "&quot;")}">${r.label.replace(
                              /"/g,
                              "&quot;"
                            )}</option>`
                        )
                        .join("")}
                    </select>
                  </div>
                  <label for="banEnd">Date de fin du bannissement :</label>
                  <input id="banEnd" type="datetime-local" class="my-swal-input">
                `
                  : "",
                customClass: {
                  input: "my-swal-input",
                },
                showCancelButton: true,
                confirmButtonText: "Oui",
                cancelButtonText: "Non",
                didOpen: () => {
                  const select = document.getElementById(
                    "banReasonSelect"
                  ) as HTMLSelectElement | null;
                  const input = document.getElementById(
                    "banReason"
                  ) as HTMLInputElement | null;
                  if (select && input) {
                    select.addEventListener("change", () => {
                      if (select.value) {
                        input.value = select.value;
                      }
                    });
                  }
                },
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
                  Swal.fire({
                    title: `${params.row.firstname} a été ${
                      params.row.isBanned ? "débanni" : "banni"
                    } !`,
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false
                  });
                }
              });
            }}
          >
            {params.row.isBanned ? "Débannir" : "Bannir"}
          </button>
        );
      },
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
            <div style={{ height: 500, width: "fit-content" }}>
              <DataGrid
                rows={users.map((user, index) => ({ id: index + 1, ...user }))}
                columns={columns}
                pageSizeOptions={[5, 10]}
                pagination
              />
            </div>
          </div>
          <div id="reports">
            <h2 className="reports-length">Messages signalés: {reports.length}</h2>
            <table>
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Email de l'utilisateur</th>
                  <th>Message signalé</th>
                  <th>Signalements</th>
                  <th>Date du premier signalement</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((msg, idx) => (
                  <tr key={msg._id || idx}>
                    <td>
                      {msg.sender
                        ? `${msg.sender.firstname || ""} ${msg.sender.name || ""}`
                        : "Utilisateur inconnu"}
                    </td>
                    <td>{msg.sender ? msg.sender.email : "Email inconnu"}</td>
                    <td>{msg.content ?? ""}</td>
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
                            {" à signalé "}{" "}
                            {msg.sender
                              ? `${msg.sender.firstname || ""} ${
                                  msg.sender.name || ""
                                }`
                              : "Utilisateur inconnu"}
                            <br />
                            {" pour la raison suivante : "}
                            <br />
                            <b>{r.reason}</b>
                            <br />
                            <p>
                              {" à "}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}