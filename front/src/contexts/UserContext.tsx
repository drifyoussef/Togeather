import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserModel } from "../models/User.model";
import { errorMessages } from "../utils/errorMessages";

interface UserContextProps {
  user: UserModel | null;
  loading: boolean;
  error: string | null;
}

const UserContext = createContext<UserContextProps>({
  user: null,
  loading: true,
  error: null,
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError(errorMessages.noTokenFound);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData: UserModel = await response.json();
          if (userData.isBanned) {
            navigate("/banned", {
              state: {
                banReason: userData.banReason,
                banEnd: userData.banEnd,
              },
            });
          } else {
            setUser(userData);
          }
        } else {
          setError(errorMessages.fetchUserDataError);
        }
      } catch (err) {
        setError(errorMessages.fetchUserDataError);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  return (
    <UserContext.Provider value={{ user, loading, error }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);