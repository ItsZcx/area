import * as AuthSession from 'expo-auth-session';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RegisterRequest, RegisterResponse, LoginRequest, LoginResponse} from "./types";
import { API_URL } from '@/config';

export const register = async (
    data: RegisterRequest
): Promise<RegisterResponse> => {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

    

        if (response.ok) {
            return { success: true, message: "Registration successful" };
        } else {
            const errorData = await response.json();
            return {
                success: false,
                message: errorData.message || "Registration failed",
            };
        }
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: "Network error or server is unreachable",
        };
    }
};

export const login = async (
    data: LoginRequest
): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                username: data.email,
                password: data.password,
                grant_type: "password",
            }).toString(),
        });

        if (response.ok) {
            const responseData: LoginResponse = await response.json();

            await AsyncStorage.setItem(
                "access_token",
                responseData.access_token
            );
            await AsyncStorage.setItem("token_type", responseData.token_type);

            return { success: true, message: "Login successful" };
        } else {
            const errorData = await response.json();
            return {
                success: false,
                message: errorData.detail || "Login failed",
            };
        }
    } catch (error) {
        console.error("Login error:", error);
        return {
            success: false,
            message: "Network error or server unreachable",
        };
    }
};

export const logout = async (): Promise<{ success: boolean; message: string }> => {
    try {
        await AsyncStorage.removeItem("access_token");
        await AsyncStorage.removeItem("token_type");

        return { success: true, message: "Logout successful" };
    } catch (error) {
        console.error("Logout error:", error);
        return { success: false, message: "Failed to log out" };
    }
};
