import React, { useEffect, useState, useCallback } from "react";
import {
  Text,
  FlatList,
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Card } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome";
import { serviceMap } from "@/utils/serviceMap";
import { getFancyName } from "@/utils/getFancyName";
import { useRouter } from "expo-router";
import { getUserTasks } from "@/api/services";
import { useUser } from "@/hooks/useUser";

export default function HomeIndex() {
  const { user, loading } = useUser();
  const [data, setData] = useState<string[]>([]);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        if (user) {
          try {
            const fetchedData = await getUserTasks(user.id);
            setData(fetchedData);
          } catch (error) {
            console.error("Error fetching user tasks:", error);
          }
        }
      };

      fetchData();
    }, [user])
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.pressableContainer}
      onPress={() =>
        router.push({ pathname: "/dashboard/details", params: item })
      }
    >
      <Card
        style={[
          styles.card,
          { backgroundColor: serviceMap[item.service].color },
        ]}
      >
        <Card.Content>
          <Icon
            name={serviceMap[item.service].icon}
            size={30}
            color="white"
            style={styles.icon}
          />
          <Text style={styles.cardTitle}>{`If ${getFancyName(
            item.trigger
          )}, then ${getFancyName(item.action_name)}`}</Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const handleButton = () => {
    router.push("/(app)/create/");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Tasks</Text>
      {data.length ? (
        <View>
          <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            style={{ marginTop: 20 }}
          />
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>You do not have any tasks yet...</Text>
          <TouchableOpacity onPress={handleButton} style={styles.createButton}>
            <Text style={styles.createButtonText}>Create New Task</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontWeight: "bold",
    fontSize: 30,
    color: "#333",
    marginTop: 30,
    marginBottom: 10,
  },
  listContainer: {
    paddingBottom: 10,
  },
  card: {
    marginVertical: 10,
    borderRadius: 15,
    padding: 15,
    elevation: 5,
  },
  icon: {
    marginBottom: 10,
  },
  cardTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#777",
    marginBottom: 20,
    textAlign: "center",
  },
  createButton: {
    backgroundColor: "#6200ea",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 2,
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
