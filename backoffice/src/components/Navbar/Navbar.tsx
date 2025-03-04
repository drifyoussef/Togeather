import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { RxHamburgerMenu } from "react-icons/rx";
import "./Navbar.css";

export default function Navbar() {

  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const isConnectionPage = [
    "/auth/admin/login",
  ].includes(location.pathname);
  

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
        <NavLink to={isConnectionPage ? "/auth/admin/login" : "/"}></NavLink>
      </div>
        <RxHamburgerMenu onClick={toggleMenu} className="navbar-toggle"/>
      <ul className={isOpen ? "navbar-links active" : "navbar-links"}>
        {!isConnectionPage ? (
          <>
           <li>
              <NavLink
                to={isConnectionPage ? "/auth/admin/login" : "/"} className={({ isActive }) => (isActive ? "active" : "")}>Accueil
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
  )
}
