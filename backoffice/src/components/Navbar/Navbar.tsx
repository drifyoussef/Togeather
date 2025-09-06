import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";
import Logo from "../../images/logo-white.png";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const isConnectionPage = ["/auth/admin/login"].includes(location.pathname);

  // Vérifier si l'utilisateur est connecté
  useEffect(() => {
    const token = localStorage.getItem("token");
    const isAdmin = localStorage.getItem("isAdmin");
    setIsLoggedIn(!!token && isAdmin === "true");
  }, [location.pathname]); // Re-vérifier quand la route change

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        localStorage.clear();
        navigate("/auth/admin/login");
      } else {
        console.error("Failed to log out");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <nav className={`navbar ${isConnectionPage ? "navbar-connection" : ""}`}>
      <div className="navbar-logo">
        <div className="navbar-logo">
        <NavLink to={isConnectionPage ? "/auth/admin/login" : "/admin/dashboard"}>
          <img src={Logo} alt="Home" className="home-navbar" />
        </NavLink>
      </div>
      </div>
      <ul className="navbar-links">
        {isLoggedIn ? (
          // Utilisateur connecté - afficher Accueil et Se déconnecter
          <>
            <li>
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Accueil
              </NavLink>
            </li>
            <li>
              <button onClick={handleLogout} className="logout-button">
                Se déconnecter
              </button>
            </li>
          </>
        ) : (
          // Utilisateur non connecté - afficher Se connecter
          <>
            <li>
              <NavLink
                to="/auth/admin/login"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Se connecter
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
