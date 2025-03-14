import { API_URL } from "@/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

// Make request auth as user.. (ne)
export const makeAuthenticatedRequest = async (route:string) => {
    try {
        // Retrieve the access token and token type from AsyncStorage
        const accessToken = await AsyncStorage.getItem("access_token");
        const tokenType = await AsyncStorage.getItem("token_type");

        // Check if the token exists
        if (!accessToken || !tokenType) {
            throw new Error("Access token or token type is missing");
        }

        // Make the authenticated request with the retrieved tokens
        const response = await fetch(
            `${API_URL}/${route}`,
            {
                method: "GET",
                headers: {
                    Authorization: `${tokenType} ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch data, status: " + response.status);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error making authenticated request:", error);
        throw error;
    }
};
