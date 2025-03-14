import React, { useEffect, useState } from "react";
import { Button, Alert } from "react-native";
import * as AuthSession from "expo-auth-session";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { API_URL } from "@/config";
import { usePathname } from "expo-router";
import * as Linking from "expo-linking";

WebBrowser.maybeCompleteAuthSession();

const GitHubAuth: React.FC = () => {
    const [hasHandledAuth, setHasHandledAuth] = useState(false); // Add state to track if auth is handled
    const [isProcessStarted, setProcessStarted] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const {
        GITHUB_MOBILE_CLIENT_ID,
        GITHUB_MOBILE_CLIENT_SECRET,
        GITHUB_CLIENT_SECRET,
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        GOOGLE_OPENID_CONFIG,
        IOS_CLIENT_ID,
        ANDROID_CLIENT_ID,
    } = Constants.expoConfig.extra;

    const isExpoGo = Constants.appOwnership === "expo";

    // Generate the redirect URI without useProxy
    // const redirectUri = AuthSession.makeRedirectUri({
    //     preferLocalhost: true,
    //     scheme: "myapp",
    // });

    const redirectUri = "myapp://sign-in"

    // Prepare the discovery object (optional, as GitHub doesn't provide an OpenID configuration)
    const discovery = {
        authorizationEndpoint: "https://github.com/login/oauth/authorize",
        tokenEndpoint: "https://github.com/login/oauth/access_token",
        revocationEndpoint: `https://github.com/settings/connections/applications/${GITHUB_MOBILE_CLIENT_ID}`,
    };

    const [request, response, promptAsync] = AuthSession.useAuthRequest(
        {
            clientId: GITHUB_MOBILE_CLIENT_ID,
            scopes: [
                "read:user",
                "user:email",
                "identity",
                "openid",
                "profile",
            ],
            responseType: AuthSession.ResponseType.Code,
            redirectUri,
            // Include useProxy in the request configuration
            // GitHub does not support PKCE
        } as AuthSession.AuthRequestConfig,
        discovery
    );


    useEffect(() => {
        if (response?.type === "success" && response.params.code) {
            const { code } = response.params;
            fetchAccessToken(code);
        } else if (response?.type === "error") {
            Alert.alert(
                "Authentication error",
                response.error?.description || "An error occurred"
            );
        }
    }, [response]);


    const fetchAccessToken = async (code: string) => {
        try {
            // Send the authorization code to the backend

            const res = await fetch(`${API_URL}/auth/github/callback/mobile`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ code }),
            });

            const data = await res.json();

            if (data.access_token) {
                // Store the JWT (or token) returned from the backend
                await AsyncStorage.setItem("access_token", data.access_token);
                Alert.alert("Success", "Logged in with GitHub!");

                // Use this token in future API calls
                router.replace("/");
            } else {
                Alert.alert("Error", "Failed to log in with GitHub");
                console.error("Error response:", data);
            }
        } catch (error) {
            console.error("Error sending code to backend:", error);
            Alert.alert(
                "Error",
                "An error occurred while logging in with GitHub"
            );
        }
    };

    return (
            <Button
                disabled={!request}
                title="Login with GitHub"
                onPress={async () => {
                    setProcessStarted(true);
                    await promptAsync();
                }}
            />
    );
};

export default GitHubAuth;
