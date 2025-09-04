import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "./components/Dashboard/Dashboard.tsx";
import Login from "./components/Login/Login.tsx";
import Navbar from "./components/Navbar/Navbar.tsx";
import './App.css';

function App() {
  // Détermine le basename selon l'environnement
  const basename = process.env.NODE_ENV === 'production' ? '/backoffice' : '';
  
  return (
    <Router basename={basename}>
      <Navbar />
      <Routes>
        <Route path="/auth/admin/login" element={<Login />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
