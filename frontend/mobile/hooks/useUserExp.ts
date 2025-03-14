// hooks/useUser.ts

import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {jwtDecode} from 'jwt-decode';

interface User {
  id: number;
  username: string;
  email: string;
  phone_number?: string;
  first_name: string;
  last_name: string;
  disabled: boolean;
  role: string;
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
        const token = await AsyncStorage.getItem('access_token');

        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }

        // Decode the JWT token
        const decodedToken: any = jwtDecode(token);

        // Optional: Check if token is expired
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp < currentTime) {
          // Token has expired
          await AsyncStorage.removeItem('access_token');
          setUser(null);
          setLoading(false);
          return;
        }

        // Extract user information from the token
        const userData: User = {
          id: decodedToken.user_id,
          username: decodedToken.username,
          email: decodedToken.email,
          phone_number: decodedToken.phone_number,
          first_name: decodedToken.first_name,
          last_name: decodedToken.last_name,
          disabled: decodedToken.disabled,
          role: decodedToken.role,
        };

        // Update state
        setUser(userData);
        setLoading(false);
      } catch (err) {
        console.error('Error decoding token:', err);
        setError('Failed to decode token');
        setUser(null);
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading, error };
};
