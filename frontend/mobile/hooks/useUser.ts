// hooks/useUser.ts

import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/config";

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
    token: {
      id: number;
      user_id: number;
      github_token: GithubToken
      google_token: GoogleToken
    }
  }

interface UseUserResult {
    user: User | null;
    loading: boolean;
    error: string | null;
}

export const useUser = (): UseUserResult => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = await AsyncStorage.getItem("access_token");

                if (!token) {
                    setUser(null);
                    setLoading(false);
                    return;
                }

                // use the /me to get more recent user data
                const response = await fetch(`${API_URL}/users/me`, {
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
                    // Token might be invalid or expired
                    await AsyncStorage.removeItem("access_token");
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
    }, []);

    return { user, loading, error };
};
