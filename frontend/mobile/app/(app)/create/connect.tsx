import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import Icon from "react-native-vector-icons/FontAwesome";
import { useCreateContext } from "./CreateContext";
import { useRouter, useLocalSearchParams } from "expo-router";
import { serviceMap } from "@/utils/serviceMap";
import { adjustColorBrightness } from "@/utils/adjustColorBrightness";
import { getActionParams, getReactionParams } from "@/api/services";

const ConnectPage = () => {
  const { form } = useCreateContext();
  const { mode } = useLocalSearchParams();
  const router = useRouter();
  const serviceName =
    mode === "action" ? form.actionService : form.reactionService;
  const service = serviceMap[serviceName];

  const handleButton = async () => {
    // TO-DO
    // Connect to service

    let params = null;
    if (mode === "action") {
      params = await getActionParams(form.action);
    } else {
      params = await getReactionParams(form.reaction);
    }
    if (params && params.length > 0) {
      router.push({
        pathname: "/create/params",
        params: { mode },
      });
    } else {
      router.push("/create");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: service.color }]}>
      <Icon name={service.icon} size={80} color="white" style={styles.icon} />
      <Text
        style={styles.title}
      >{`Connect to ${service.name} to continue`}</Text>
      <TouchableOpacity
        onPress={handleButton}
        style={[
          styles.button,
          { backgroundColor: adjustColorBrightness(service.color, -40) },
        ]}
      >
        <Text style={styles.buttonText}>Connect</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ConnectPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  icon: {
    marginTop: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    marginHorizontal: 50,
    marginBottom: 50,
  },
  button: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 50,
    paddingVertical: 15,
    paddingHorizontal: 25,
  },
  buttonText: {
    alignSelf: "center",
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
  },
});
