import React, { useState } from "react";
import {
    Text,
    View,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";
import { Link } from "expo-router";
import { styled } from "nativewind";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import ErrorMessage from "../../components/ErrorMessage";
import { register, login } from "../../api/auth";
import { useNavigation } from "@react-navigation/native";

// Import Google and GitHub Auth Components
import GoogleAuth from "../../components/auth/GoogleAuth";
import GitHubAuth from "../../components/auth/GitHubAuth";

const StyledLink = styled(Link);
const StyledText = styled(Text);
const StyledView = styled(View);

const SingUp = ({ navigation }) => {
    // const { user, loading, error } = useUser();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleRegister = async () => {
        if (!username || !email || !password || !firstName || !lastName) {
            setErrorMessage("Please fill out all required fields.");
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
                username: username,
                email: email,
                password: password,
                first_name: firstName,
                last_name: lastName,
                phone_number: phoneNumber || null,
                role: "user",
            };
            const result = await register(data);

            if (result.success) {
                const loginResult = await login({
                    email: email,
                    password: password,
                });

                if (loginResult.success) {
                    navigation.replace("Home");
                } else {
                    setErrorMessage("Login Failed");
                }
            } else {
                setErrorMessage("Registration Failed");
            }
        } catch (error) {
            console.error("Registration error:", error);
            setErrorMessage("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                <StyledView className="flex-1 justify-center items-center bg-gray-100 px-6">
                    <StyledText className="text-3xl font-bold text-gray-900 mb-8">
                        Register to Area
                    </StyledText>

                    <ErrorMessage message={errorMessage} />

                    <CustomInput
                        placeholder="Username"
                        value={username}
                        onChangeText={setUsername}
                    />
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
                    <CustomInput
                        placeholder="First Name"
                        value={firstName}
                        onChangeText={setFirstName}
                    />
                    <CustomInput
                        placeholder="Last Name"
                        value={lastName}
                        onChangeText={setLastName}
                    />
                    <CustomInput
                        placeholder="Phone Number (optional)"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        keyboardType="phone-pad"
                    />

                    <CustomButton
                        title="Register"
                        onPress={handleRegister}
                        isLoading={isLoading}
                    />

                    <StyledText className="text-center text-lg font-semibold text-gray-500 mt-8">
                        Or sign up with:
                    </StyledText>

                    {/* Integrate Google and GitHub Auth
                    <StyledView className="flex-row space-x-4 mt-4">
                        <GoogleAuth />
                        <GitHubAuth />
                    </StyledView> */}

                    <StyledView className="mt-4 flex-row items-center">
                        <StyledText className="text-gray-500">
                            Already have an account?
                        </StyledText>
                        <StyledLink
                            href="/sign-in"
                            className="text-indigo-500 ml-2"
                        >
                            Login here
                        </StyledLink>
                    </StyledView>
                </StyledView>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default SingUp;
