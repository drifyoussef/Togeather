import React from "react";
import "./App.css";
import Navbar from "./components/Navbar/Navbar";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home/Home";
import Profile from "./components/Profile/Profile";
import Messages from "./components/Messages/Messages";
import Browse from "./components/Browse/Browse";
import Connection from "./components/Connection/Connection";
import Register from "./components/Register/Register";
import Login from "./components/Login/Login";
import UserProfile from './components/UserProfile/UserProfile';


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:id" element={<UserProfile />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/browse/:category" element={<Browse />} />
        <Route path="/connection" element={<Connection />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/login" element={<Login /> } />
      </Routes>
    </Router>
  );
}

export default App;
