import React, { useState, useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome";
import { useCreateContext } from "./CreateContext";
import { useNavigation } from "@react-navigation/native";
import { serviceMap } from "@/utils/serviceMap";
import { getFancyName } from "@/utils/getFancyName";
import { router } from "expo-router";
import { useUser } from "@/hooks/useUser";
import { API_URL } from "@/config";
import { getUserGithubToken, getUserGoogleToken } from "@/api/services";

export default function FinalizePage() {
  const { user, loading, error } = useUser();
  const { form } = useCreateContext();
  const [appletTitle, setAppletTitle] = useState("");
  const navigation = useNavigation();
  const actionService = serviceMap[form.actionService];
  const reactionService = serviceMap[form.reactionService];

  useEffect(() => {
    navigation.setOptions({
      title: "Review and finish",
    });

    if (form.action && form.reaction) {
      setAppletTitle(
        `If ${getFancyName(form.action)}, then ${getFancyName(form.reaction)}`
      );
    }
  }, [form.action, form.reaction]);

  async function getServiceToken(service?: string) {

    let token;
    // get token from th db
    if (user) {
        switch (service) {
            case "google":
                token = await getUserGoogleToken(user.id);
                console.log("github token", token);
                return token.access_token;
            case "github":
                token = await getUserGithubToken(user.id);
                console.log("github token response", token)
                return token.hashed_token;
            default:
                return null;
        }
    }

    console.log(token);
    return null;
  }

  const handleSubmit = async () => {
    const data = {
      trigger: form.action,
      trigger_args: (() => {
        // Initialize an empty array for trigger arguments
        let args = [];
        // Get the values of trigger.params if they exist
        const paramsArgs = form.actionParams
          ? Object.values(form.actionParams)
          : [];
        // Check if the trigger.title matches one of the specified titles
        if (!form.action) return;
        if (
          [
            "email_sent",
            "email_received",
            "email_received_from_person",
            "calendar_event_created",
          ].includes(form.action)
        ) {
          // Prepend the default values to the paramsArgs
          args = ["area-epitech-437409", "Area-Epitech", ...paramsArgs];
        } else {
          // For other triggers, use only the paramsArgs
          args = paramsArgs;
        }
        return args;
      })(),
      action_name: form.reaction,
      action_params: form.reactionParams
        ? Object.values(form.reactionParams)
        : [],
      params: {
        oauth_token: await getServiceToken(form.actionService),
        service: form.actionService,
      },
      user_id: user?.id,
    };

    // CALL
    try {
      const res = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        console.error("Failed to save flow");
        return;
      }
      router.push("/(app)");
    } catch (err) {
      console.error("Failed to save flow", err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.info, { backgroundColor: actionService.color }]}>
        <View style={styles.iconsContainer}>
          <Icon
            name={actionService.icon}
            size={40}
            color="white"
            style={styles.icon}
          />
          <Icon name={reactionService.icon} size={40} color="white" />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.titleText}>Title of the task</Text>
        </View>

        <TextInput
          mode="outlined"
          value={appletTitle}
          onChangeText={(text) => setAppletTitle(text)}
          style={styles.textInput}
          multiline={true}
          maxLength={140}
          numberOfLines={4}
          placeholder="Enter up to 140 characters"
        />
      </View>

      <Button
        mode="contained"
        onPress={handleSubmit}
        style={styles.submitButton}
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonText}
      >
        Finish
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f9f9f9",
  },
  info: {
    paddingHorizontal: 20,
  },
  iconsContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 20,
    marginBottom: 15,
  },
  icon: {
    marginRight: 10,
  },
  textContainer: {
    flexDirection: "row",
  },
  titleText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    alignSelf: "flex-start",
    width: "100%",
  },
  textInput: {
    width: "100%",
    backgroundColor: "white",
    fontWeight: "bold",
    marginBottom: 20,
    fontSize: 20,
  },
  submitButton: {
    backgroundColor: "black",
    marginTop: 20,
    width: "90%",
    alignSelf: "center",
  },
  buttonContent: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
