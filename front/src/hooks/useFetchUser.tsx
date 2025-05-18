import { useState, useEffect } from "react";
import { UserModel } from "../models/User.model";

export const useFetchUser = () => {
  const [user, setUser] = useState<UserModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found");
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
          setUser(userData);
        } else {
          setError("Failed to fetch user data");
        }
      } catch (err) {
        setError("An error occurred while fetching user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading, error };
};