import React, { createContext, useState, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { API_URL } from "@/config";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);

  const fetchUserInfo = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");

      if (!token) {
        console.error("No access token found");
        return;
      }

      const url = API_URL + "/users/me";
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUserInfo(response.data);
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };
  return (
    <UserContext.Provider value={{ userInfo, fetchUserInfo }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
