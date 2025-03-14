import React, { useState, useEffect } from "react";
import { View, KeyboardAvoidingView, Platform, Text } from "react-native";
import { Link, router } from "expo-router";
import { styled } from "nativewind";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import ErrorMessage from "../../components/ErrorMessage";
import { saveToSecureStore, getFromSecureStore } from "../../utils/secureStore";
import { login } from "../../api/auth"; // Import the login function
import { useNavigation } from "@react-navigation/native";

// Import Google and GitHub Auth Components
import GoogleAuth from "../../components/auth/GoogleAuth";
import GitHubAuth from "../../components/auth/GitHubAuth";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledLink = styled(Link);

const SignIn = ({}) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const loadEmail = async () => {
            const savedEmail = await getFromSecureStore("userEmail");
            if (savedEmail) {
                setEmail(savedEmail);
            }
        };
        loadEmail();
    }, []);

    const handleLogin = async () => {
        if (!email || !password) {
            setErrorMessage("Please enter both email and password.");
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setErrorMessage("Please enter a valid email address.");
            return;
        }

        setErrorMessage("");
        setIsLoading(true);

        try {
            const data = {
                email: email,
                password: password,
            };

            const result = await login(data);

            if (result.success) {
                await saveToSecureStore("userEmail", email);
                setIsLoading(false);
                router.push("/");
            } else {
                setErrorMessage("Login Failed");
            }
        } catch (error) {
            console.error("Login error:", error);
            setErrorMessage("An unexpected error occurred");
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <StyledView className="flex-1 justify-center items-center bg-gray-100 px-6">
                <StyledText className="text-3xl font-bold text-gray-900 mb-8">
                    Login to Area
                </StyledText>

                <ErrorMessage message={errorMessage} />

                <CustomInput
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                />
                <CustomInput
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    isPassword
                />

                <CustomButton
                    title="Login"
                    onPress={handleLogin}
                    isLoading={isLoading}
                />

                <StyledText className="text-center text-lg font-semibold text-gray-500 mt-8">
                    Or sign in with:
                </StyledText>

                {/* Integrate Google and GitHub Auth */}
                <StyledView className="flex-row space-x-4 mt-4">
                    <GoogleAuth />
                    <GitHubAuth />
                </StyledView>

                <StyledView className="mt-4 flex-row items-center">
                    <StyledText className="text-gray-500">
                        Don't have an account?
                    </StyledText>
                    <StyledLink
                        href="/sign-up"
                        className="text-indigo-500 ml-2"
                    >
                        Register here
                    </StyledLink>
                </StyledView>
            </StyledView>
        </KeyboardAvoidingView>
    );
};

export default SignIn;
