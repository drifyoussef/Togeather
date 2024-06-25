import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/auth/logout", {
        method: "GET",
        credentials: "include", // Ensure cookies are included
      });
      if (response.ok) {
        navigate("/connection"); // Redirect to connection page after logout
      } else {
        console.error("Failed to log out");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Check if the current path is the connection page
  const isConnectionPage = [
    "/connection",
    "/auth/login",
    "/auth/register",
  ].includes(location.pathname);

  return (
    <nav className={`navbar ${isConnectionPage ? "navbar-connection" : ""}`}>
      <div className="navbar-logo">
        <NavLink to="/">Togeather</NavLink>
      </div>
      <div className="menu-icon" onClick={toggleMenu}>
        <i className={isOpen ? "fas fa-times" : "fas fa-bars"}></i>
      </div>
      <ul className={isOpen ? "navbar-links active" : "navbar-links"}>
        {!isConnectionPage ? (
          <>
            <li>
              <NavLink
                to="/profile"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Mon profil
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/messages"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Mes messages
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/browse"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Parcourir
              </NavLink>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="logout-button"
              >
                Se déconnecter
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <NavLink
                to="/auth/login"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Se connecter
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/auth/register"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                S'inscrire
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
