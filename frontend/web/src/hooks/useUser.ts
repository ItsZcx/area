import { useState, useEffect } from "react";
import Cookies from 'js-cookie';
import useAuthStatus from "./useAuthStatus";

interface GithubToken {
  id: number;
  hashed_token: string;
  token_type: string;
  scope: string;
}

interface GoogleToken {
  id: number;
  access_token: string;
  refresh_token: string;
  token_type: string;
  scope: string;
  expires_at: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  phone_number?: string;
  first_name: string;
  last_name: string;
  disabled: boolean;
  role: string;
  plan: string;
  token: {
    id: number;
    user_id: number;
    github_token: GithubToken
    google_token: GoogleToken
  }
}

interface UseUserResult {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  error: string | null;
}

export const useUser = (): UseUserResult => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const isLogged = useAuthStatus();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = Cookies.get('authToken');

        if (!token) {
          console.log("No token found");
          setUser(null);
          setLoading(false);
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData: User = await response.json();
          setUser(userData);
        } else {
          Cookies.remove('authToken');
          setUser(null);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to fetch user data");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [isLogged]);

  return { user, setUser, loading, error };
};
