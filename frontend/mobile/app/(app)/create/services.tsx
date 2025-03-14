import React, { useEffect, useState } from "react";
import { View, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import SearchBar from "@/components/SearchBar";
import CustomCard from "@/components/CustomCard";
import { getAllServices } from "@/api/services";
import { useCreateContext } from "./CreateContext";

const MyFlatListPage = () => {
  const [services, setServices] = useState<string[]>([]);
  const [filteredServices, setFilteredServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { setForm } = useCreateContext();
  const [searchQuery, setSearchQuery] = useState("");
  const { mode } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        let servicesData = await getAllServices();
        servicesData = ["github", "google"]
        setServices(servicesData);
        setFilteredServices(servicesData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching services:", error);
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      title: "Select the activating service",
    });
  });

  const onChangeSearch = (query: string) => {
    setSearchQuery(query);
    if (query === "") {
      setFilteredServices(services);
    } else {
      const filtered = services.filter((service) =>
        service.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredServices(filtered);
    }
  };

  const handleActionSelect = (service: string) => {
    if (mode === "action") {
      setForm((prevForm) => ({ ...prevForm,  actionService: service}));
    } else if (mode === "reaction") {
      setForm((prevForm) => ({ ...prevForm, reactionService: service }));
    }
    router.push({
      pathname: "/create/actions",
      params: { mode },
    })
  };

  if (loading) {
    // return <ActivityIndicator size="large" style={styles.loading} />;
    return <ActivityIndicator size="large" />;
  }

  return (
    <View>
      <SearchBar
        placeholder="Search services"
        value={searchQuery}
        onChangeText={onChangeSearch}
      />
      <FlatList
        data={filteredServices}
        renderItem={({ item }) => {
          return (
            <CustomCard
              title={item}
              onPress={() => handleActionSelect(item)}
            />
          );
        }}
        keyExtractor={(item) => item}
        numColumns={2}
      />
    </View>
  );
};

const styles = StyleSheet.create({

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MyFlatListPage;
