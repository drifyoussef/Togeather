import React from 'react';

const AuthMiddleware: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('token'); // Si le token est trouvé alors l'utilisateur est authentifié

  // Si l'utilisateur n'est pas authentifié alors afficher une alerte et rediriger vers la page de connexion
  if (!isAuthenticated) {
    localStorage.setItem("showSwal", "true");
      window.location.href = '/connection';
  }

  return <>{children}</>;
};

export default AuthMiddleware;