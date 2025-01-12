import React from "react";
import "./App.css";
import Navbar from "./components/Navbar/Navbar";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Home from "./components/Home/Home";
import Profile from "./components/Profile/Profile";
import Messages from "./components/Messages/Messages";
import Browse from "./components/Browse/Browse";
import Connection from "./components/Connection/Connection";
import Register from "./components/Register/Register";
import Login from "./components/Login/Login";
import UserProfile from './components/UserProfile/UserProfile';
import Restaurant from './components/Restaurant/Restaurant';
import UserMessages from './components/UserMessages/UserMessages';
import Premium from './components/Premium/Premium';
import Success from "./components/Success/Success";
import Cancel from "./components/Cancel/Cancel";
import ConfirmEmail from "./components/ConfirmEmail/ConfirmEmail";

const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

// Composant principal de l'application (contient les routes)
function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={isAuthenticated() ? <Home /> : <Navigate to="/connection" />} />
        <Route path="/profile" element={isAuthenticated() ? <Profile /> : <Navigate to="/connection" />} />
        <Route path="/profile/:id" element={isAuthenticated() ? <UserProfile /> : <Navigate to="/connection" />} />
        <Route path="/messages" element={isAuthenticated() ? <Messages /> : <Navigate to="/connection" />} />
        <Route path="/messages/:id" element={isAuthenticated() ? <UserMessages /> : <Navigate to="/connection" />} />
        <Route path="/browse" element={isAuthenticated() ? <Browse /> : <Navigate to="/connection" />} />
        <Route path="/browse/:category" element={isAuthenticated() ? <Browse /> : <Navigate to="/connection" />} />
        <Route path="/browse/:category/:place_id" element={isAuthenticated() ? <Restaurant /> : <Navigate to="/connection" />} />
        <Route path="/connection" element={<Connection />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/premium" element={isAuthenticated() ? <Premium /> : <Navigate to="/connection" />} />
        <Route path="/success" element={isAuthenticated() ? <Success /> : <Navigate to="/connection" />} />
        <Route path="/cancel" element={isAuthenticated() ? <Cancel /> : <Navigate to="/connection" />} />
        <Route path="/confirm-email" element={<ConfirmEmail data={{ message: "" }} />} />
      </Routes>
    </Router>
  );
}


export default App;
