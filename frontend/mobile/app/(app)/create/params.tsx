import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCreateContext } from "./CreateContext";
import { serviceMap } from "@/utils/serviceMap";
import { getActionParams, getReactionParams } from "@/api/services";
import { getFancyName } from "@/utils/getFancyName";
import { adjustColorBrightness } from "@/utils/adjustColorBrightness";

const screenHeight = Dimensions.get("window").height;

export default function ParamsInputScreen() {
  const [params, setParams] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState("");
  const { mode } = useLocalSearchParams();
  const { form, setForm } = useCreateContext();
  const serviceName =
    mode === "action" ? form.actionService : form.reactionService;
  const service = serviceMap[serviceName];
  const router = useRouter();

  useEffect(() => {
    const fetchParams = async () => {
      let data = null;
      try {
        if (mode === "action") {
          data = await getActionParams(form.action);
          setAction(form.action);
        } else {
          data = await getReactionParams(form.reaction);
          setAction(form.reaction);
        }
        setParams(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching parameters:", error);
        setLoading(false);
      }
    };

    fetchParams();
  }, []);

  const handleInputChange = (paramName, value) => {
    setFormData((prev) => ({
      ...prev,
      [paramName]: value,
    }));
  };


const handleSubmit = () => {
    if (mode === 'action') {
      setForm((prevForm) => ({
        ...prevForm,
        actionParams: formData,
      }));
    } else {
      setForm((prevForm) => ({
        ...prevForm,
        reactionParams: formData,
      }));
    }
    router.push('/create');
  };

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <View style={[styles.container, { backgroundColor: service.color }]}>
      <View style={styles.topSection}>
        <Icon name={service.icon} size={80} color="white" />
        <Text style={styles.serviceTitle}>{getFancyName(action)}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {params.map((item) => (
          <View key={item.id} style={styles.inputContainer}>
            <Text style={styles.paramTitle}>{item.label}</Text>
            <TextInput
              mode="outlined"
              value={formData[item.id] || ""}
              onChangeText={(text) => handleInputChange(item.id, text)}
              style={styles.textInput}
              theme={{ colors: { text: "black" } }}
              placeholder={item.placeholder}
            />
          </View>
        ))}

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={[
            styles.submitButton,
            { backgroundColor: adjustColorBrightness(service.color, -40) },
          ]}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonText}
        >
          Continue
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    height: screenHeight / 3,
    justifyContent: "center",
    alignItems: "center",
  },
  serviceTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    alignSelf: "center",
  },
  scrollContainer: {
    paddingVertical: 20,
  },
  inputContainer: {
    marginBottom: 20,
    alignItems: "center",
    width: "90%",
    alignSelf: "center",
  },
  paramTitle: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 5,
    alignSelf: "flex-start",
  },
  textInput: {
    width: "100%",
    backgroundColor: "white",
    fontWeight: "bold",
  },
  submitButton: {
    marginTop: 20,
    width: "90%",
    alignSelf: "center",
    marginBottom: 20,
  },
  buttonContent: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
