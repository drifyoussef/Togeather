import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { RxHamburgerMenu } from "react-icons/rx";
import "./Navbar.css";
import Logo from "../../../src/images/logo-white.png";

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
        credentials: "include",
      });
      if (response.ok) {
        localStorage.clear();
        navigate("/connection");
      } else {
        console.error("Failed to log out");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const isConnectionPage = [
    "/connection",
    "/auth/login",
    "/auth/register",
  ].includes(location.pathname);

  return (
    <nav className={`navbar ${isConnectionPage ? "navbar-connection" : ""}`}>
      <div className="navbar-logo">
        <NavLink to={isConnectionPage ? "/connection" : "/"}><img src={Logo} alt="" className="home-navbar" /></NavLink>
      </div>
        <RxHamburgerMenu onClick={toggleMenu} className="navbar-toggle"/>
      <ul className={isOpen ? "navbar-links active" : "navbar-links"}>
        {!isConnectionPage ? (
          <>
           <li>
              <NavLink
                to="/premium"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Premium
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
              <NavLink
                to="/messages"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Mes messages
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/profile"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Mon profil
              </NavLink>
            </li>
            <li>
              <button onClick={handleLogout} className="logout-button">
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
