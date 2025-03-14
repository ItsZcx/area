import {
    View,
    Button,
    Alert,
    Text,
    StyleSheet,
    Modal,
    Pressable,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { useUserContext } from "@/context/UserProvider";
import { logout } from "@/api/auth";
import { useUser } from "@/hooks/useUser";

const Profile = () => {
    const { user, loading, error } = useUser();
    //   const { userInfo } = useUserContext();
    const router = useRouter();
    const [modalVisible, setModalVisible] = useState(false);

    if (loading) {
        return <Text>Loading...</Text>;
    }

    const handleLogoutConfirm = async () => {
        const result = await logout();
        if (result.success) {
            router.replace("/(auth)/sign-in");
        } else {
            Alert.alert("Error", result.message);
        }
    };

    const openLogoutModal = () => {
        setModalVisible(true);
    };

    const closeLogoutModal = () => {
        setModalVisible(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profile</Text>
            <Text style={styles.label}>Name: {user?.first_name}</Text>
            <Text style={styles.label}>Email: {user?.email}</Text>
            <Text style={styles.label}>Phone: {user?.phone_number}</Text>
            <Text style={styles.label}>Role: {user?.role}</Text>
            <Button title="Logout" onPress={openLogoutModal} />

            {/* Logout Confirmation Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeLogoutModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalText}>
                            Are you sure you want to logout?
                        </Text>
                        <View style={styles.buttonContainer}>
                            <Pressable
                                style={[styles.button, styles.buttonCancel]}
                                onPress={closeLogoutModal}
                            >
                                <Text style={styles.textStyle}>Cancel</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.button, styles.buttonConfirm]}
                                onPress={handleLogoutConfirm}
                            >
                                <Text style={styles.textStyle}>Logout</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
    },
    label: {
        fontSize: 18,
        marginBottom: 8,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Transparent overlay
    },
    modalContainer: {
        width: 300,
        padding: 20,
        backgroundColor: "white",
        borderRadius: 10,
        alignItems: "center",
    },
    modalText: {
        fontSize: 18,
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    button: {
        padding: 10,
        borderRadius: 5,
        elevation: 2,
        marginHorizontal: 10,
    },
    buttonCancel: {
        backgroundColor: "#d3d3d3",
    },
    buttonConfirm: {
        backgroundColor: "#ff0000",
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
    },
});

export default Profile;
