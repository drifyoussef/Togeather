import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login/Login';
import Dashboard from './components/Dashboard/Dashboard';
import Navbar from "./components/Navbar/Navbar";
import './App.css';

// Composant pour protéger les routes admin
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  const isAdmin = localStorage.getItem('isAdmin');
  
  return token && isAdmin === 'true' ? <>{children}</> : <Navigate to="/admin/login" />;
};

function App() {
  return (
    <div className="App">
      <Navbar />
      <Routes>
        {/* Redirection de la racine vers le login admin */}
        <Route path="/" element={<Navigate to="/admin/login" />} />
        
        {/* Route de login admin */}
        <Route path="/admin/login" element={<Login />} />
        
        {/* Routes protégées pour l'admin */}
        <Route 
          path="/admin/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        
        {/* Route par défaut */}
        <Route path="*" element={<Navigate to="/admin/login" />} />
      </Routes>
    </div>
  );
}

export default App;
