import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Icon from "react-native-vector-icons/FontAwesome";
import { serviceMap } from "@/utils/serviceMap";
import { getFancyName } from "@/utils/getFancyName";

import { API_URL } from "@/config";

export default function DetailsPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const {
    id,
    trigger,
    action_name,
    service,
    trigger_args,
    event_hash,
    requires_oauth,
    user_id,
  } = params;

  const serviceInfo = serviceMap[service] || {
    icon: "question",
    color: "gray",
  };

  const handleDelete = async () => {
    const res = await fetch(`${API_URL}/tasks/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      console.error("Failed to delete task");
      return;
    }
    router.push("/(app)");
  };

  return (
    <View style={styles.container}>
      <View
        style={[styles.topContainer, { backgroundColor: serviceInfo.color }]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.iconButton}
          >
            <Icon name="arrow-left" size={30} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/(app)/create")}
            style={styles.iconButton}
          >
            <Icon name="cog" size={30} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.info}>
          <Icon
            name={serviceInfo.icon}
            size={60}
            color="white"
            style={styles.icon}
          />
          <Text style={styles.title}>{`If ${getFancyName(
            trigger
          )}, then ${getFancyName(action_name)}`}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleDelete}>
        <Text style={styles.buttonTitle}>Delete</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  iconButton: {
    padding: 10,
  },
  info: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  topContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 40,
  },
  icon: {
    marginBottom: 20,
    marginLeft: 5,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
  },
  button: {
    marginHorizontal: 30,
    marginVertical: 30,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 50,
    alignItems: "center",
    backgroundColor: "red",
  },
  buttonTitle: {
    color: "white",
    fontWeight: "bold",
    fontSize: 30,
  },
});
