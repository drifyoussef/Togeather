import React from 'react';

const AuthMiddleware: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('token'); // Adjust this according to your authentication logic

  if (!isAuthenticated) {
    localStorage.setItem("showSwal", "true");
      window.location.href = '/auth/login';
  }

  return <>{children}</>;
};

export default AuthMiddleware;