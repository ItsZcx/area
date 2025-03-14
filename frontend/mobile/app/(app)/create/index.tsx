import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useCreateContext } from "./CreateContext";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome";
import { serviceMap } from "@/utils/serviceMap";
import { getFancyName } from "@/utils/getFancyName";

// Component for adding a new item
const AddComponent = () => (
  <View style={styles.addComponent}>
    <Text style={styles.addText}>Add</Text>
  </View>
);

export default function CreateIndex() {
  const { form } = useCreateContext();
  const router = useRouter();
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ title: "Create" });
  }, [form.action, form.reaction]);

  // Dynamically determine button background colors
  const getActionButtonStyle = () => ({
    backgroundColor: form.actionService
      ? serviceMap[form.actionService].color
      : "black",
  });

  const getReactionButtonStyle = () => ({
    backgroundColor: form.reactionService
      ? serviceMap[form.reactionService].color
      : form.action
      ? "black"
      : "gray",
  });

  return (
    <View style={styles.container}>
      <ActionButton
        onPress={() =>
          router.push({
            pathname: "/create/services",
            params: { mode: "action" },
          })
        }
        style={getActionButtonStyle()}
        label="If this"
        selectedLabel={`If ${form.action}`}
        icon={form.actionService && serviceMap[form.actionService].icon}
        action={getFancyName(form.action)}
        AddComponent={!form.action && <AddComponent />}
      />

      <ActionButton
        onPress={() =>
          router.push({
            pathname: "/create/services",
            params: { mode: "reaction" },
          })
        }
        style={getReactionButtonStyle()}
        label="Then that"
        selectedLabel={`Then ${form.reaction}`}
        icon={form.reactionService && serviceMap[form.reactionService].icon}
        action={getFancyName(form.reaction)}
        disabled={!form.action}
        AddComponent={form.action && !form.reaction && <AddComponent />}
      />

      {form.action && form.reaction && (
        <TouchableOpacity
          onPress={() => router.push("/create/finalize")}
          style={[styles.button, styles.continueButton]}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Reusable ActionButton component
const ActionButton = ({
  onPress,
  style,
  label,
  selectedLabel,
  icon,
  action,
  disabled,
  AddComponent,
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.button, style]}
    disabled={disabled}
  >
    <View style={styles.buttonContent}>
      <View>
        {action ? (
          <View style={styles.labelContainer}>
            <View style={styles.labelWithIcon}>
              <Text style={styles.buttonText}>
                {selectedLabel.split(" ")[0]}
              </Text>
              {icon && (
                <Icon name={icon} size={25} color="white" style={styles.icon} />
              )}
            </View>
            <Text style={styles.actionText}>{action}</Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>{label}</Text>
        )}
      </View>
      {AddComponent}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  button: {
    width: "90%",
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 30,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    width: "100%",
    padding: 15,
    paddingHorizontal: 20,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: 10,
  },
  labelWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
    marginRight: 10,
  },
  icon: {
    marginLeft: 10,
  },
  actionText: {
    fontSize: 20,
    color: "white",
    flex: 1,
    marginLeft: 10,
    lineHeight: 25,
  },
  buttonText: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
  },
  continueButton: {
    backgroundColor: "black",
    borderRadius: 50,
    paddingVertical: 10,
  },
  addComponent: {
    backgroundColor: "white",
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  addText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
