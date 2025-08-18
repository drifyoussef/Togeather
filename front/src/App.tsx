import React, { useEffect, useState } from "react";
import "./App.css";
import Navbar from "./components/Navbar/Navbar";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
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
import Cgu from "./components/Cgu/Cgu";
import Cgv from "./components/Cgv/Cgv";
import Banned from "./components/Banned/Banned";
import Footer from "./components/Footer/Footer";
import { UserModel } from './models/User.model';

// Extend Window interface to include Axeptio
declare global {
  interface Window {
    Axeptio?: {
      reload: () => void;
      // add other properties/methods if needed
    };
  }
}

function App() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [user, setUser] = useState<UserModel | null>(null);

  const location = useLocation();
  useEffect(() => {
    if (window.Axeptio) {
      window.Axeptio.reload();
    }
  }, [location.pathname]);

  return (
    <div className="App">
      <Navbar />
      <main className="main-content">
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cgu" element={<Cgu />} />
            <Route path="/cgv" element={<Cgv />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:id" element={<UserProfile />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/messages/:id" element={<UserMessages />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/browse/:category" element={<Browse />} />
            <Route path="/browse/:category/:place_id" element={<Restaurant />} />
            <Route path="/connection" element={<Connection />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/premium" element={<Premium />} />
            <Route path="/success" element={<Success />} />
            <Route path="/cancel" element={<Cancel />} />
            <Route path="/confirm-email" element={<ConfirmEmail data={{ message: "" }} />} />
            {/* {user && <Route path="/banned" element={<Banned user={user} />} />} */}
            <Route path="/banned" element={<Banned user={user as any} />} />
        </Routes>
      </main>
      <footer className="footer">
        <Footer />
      </footer>
    </div>
  );
}

export default App;