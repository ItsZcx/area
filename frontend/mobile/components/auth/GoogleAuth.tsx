// GoogleAuth.tsx
import React, { useEffect } from "react";
import { Button, Alert, Platform } from "react-native";
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/config";

WebBrowser.maybeCompleteAuthSession();

const platform = Platform.OS;

const GoogleAuth: React.FC = () => {
    const router = useRouter();
    const {
        GITHUB_CLIENT_ID,
        GITHUB_CLIENT_SECRET,
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        GOOGLE_OPENID_CONFIG,
        IOS_CLIENT_ID,
        ANDROID_CLIENT_ID,
        EXPO_WEB_GOOGLE_CLIENT_ID,
    } = Constants.expoConfig.extra;


    const [request, response, promptAsync] = Google.useAuthRequest({
        iosClientId: IOS_CLIENT_ID,
        androidClientId: ANDROID_CLIENT_ID,
        webClientId: EXPO_WEB_GOOGLE_CLIENT_ID,
        redirectUri: "com.rozzo.mobile:/sign-in",
    });


    useEffect(() => {
        if (response) {
        }
        if (response?.type === "success" && response.params.code) {
            const token = response.authentication;
            if (!token) return;
            fetchAccessToken(token);
            // token is response.authentication.accessToken
            // fetchAccessToken(code);
        } else if (response?.type === "error") {
            Alert.alert(
                "Authentication error",
                response.error?.description || "An error occurred"
            );
        }
    }, [response]);

    const fetchAccessToken = async (token: AuthSession.TokenResponse) => {
        try {
            const token_body = JSON.stringify({ token, platform });

            const res = await fetch(
                `${API_URL}/auth/google/callback/mobile`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json", // Ensure content type is JSON
                    },
                    body: token_body,
                }
            );

            const data = await res.json();

            if (data.access_token) {
                await AsyncStorage.setItem("access_token", data.access_token);
                Alert.alert("Success", "Logged in with Google!");
                const token = await AsyncStorage.getItem("access_token");
                router.replace("/");
                // Navigate to the next screen or update your app state
            } else {
                Alert.alert("Error", "Failed to get access token");
            }
        } catch (error) {
            console.error("Error fetching access token:", error);
            Alert.alert(
                "Error",
                "An error occurred while fetching the access token"
            );
        }
    };

    return (
        <Button
            disabled={!request}
            title="Login with Google"
            onPress={() => {
                promptAsync({ showInRecents: false });
            }}
        />
    );
};

export default GoogleAuth;
