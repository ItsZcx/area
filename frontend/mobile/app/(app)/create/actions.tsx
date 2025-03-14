import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  View,
  FlatList,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Text, Card } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useUserContext } from "@/context/UserProvider";
import { useCreateContext } from "./CreateContext";
import { serviceMap } from "@/utils/serviceMap";
import {
  getServiceActions,
  getServicesReactions,
  getActionParams,
  getReactionParams,
} from "@/api/services";
import { getFancyName } from "@/utils/getFancyName";

const screenHeight = Dimensions.get("window").height;

export default function ActionsScreen() {
  const { userInfo } = useUserContext();
  const [actions, setActions] = useState<String[]>([]);
  const [loading, setLoading] = useState(true);
  const { mode } = useLocalSearchParams();
  const router = useRouter();
  const { form, setForm } = useCreateContext();
  const serviceName =
    mode === "action" ? form.actionService : form.reactionService;
  const service = serviceMap[serviceName];

  useEffect(() => {
    const fetchActions = async () => {
      let data = null;
      try {
        if (mode === "action") {
          data = await getServiceActions(serviceName);
        } else {
          data = await getServicesReactions(serviceName);
        }
        setActions(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching actions:", error);
        setLoading(false);
      }
    };

    fetchActions();
  }, []);

  const isUserConnectedToService = (service: string) => {
    // TO-DO
    return true; // chnage to handle
  };

  const handleActionSelect = async (selectedAction: string) => {
    if (mode === "action") {
      setForm((prevForm) => ({ ...prevForm, action: selectedAction }));
    } else if (mode === "reaction") {
      setForm((prevForm) => ({ ...prevForm, reaction: selectedAction }));
    }

    // TO-DO
    // Check if the user is connected to the service
    // If the user is connected, nothing

    const service =
      mode === "action" ? form.actionService : form.reactionService;

    if (!isUserConnectedToService(service)) {
      router.push({
        pathname: "/create/connect",
        params: { mode },
      });
    } else {
      let params = null;
      if (mode === "action") {
        params = await getActionParams(selectedAction);
      } else {
        params = await getReactionParams(selectedAction);
      }
      if (params && params.length > 0) {
        router.push({
          pathname: "/create/params",
          params: { mode },
        });
      } else {
        router.push("/create");
      }
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.topSection, { backgroundColor: service.color }]}>
        <Icon name={service.icon} size={80} color="white" />
        <Text style={styles.serviceTitle}>{service.name}</Text>
      </View>

      <FlatList
        data={actions}
        renderItem={({ item }) => (
          <Card
            style={[styles.actionCard, { backgroundColor: service.color }]}
            onPress={() => handleActionSelect(item)}
          >
            <Card.Content>
              <Text style={styles.actionText}>{getFancyName(item)}</Text>
            </Card.Content>
          </Card>
        )}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  topSection: {
    height: screenHeight / 3,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  serviceTitle: {
    color: "white",
    fontSize: 36,
    fontWeight: "bold",
    marginTop: 20,
  },
  listContainer: {
    padding: 20,
  },
  actionCard: {
    width: "100%",
    marginVertical: 10,
  },

  actionText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
});
