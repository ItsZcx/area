import { UserProvider } from "@/context/UserProvider";
import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <UserProvider>
      <Tabs>
        <Tabs.Screen
          name="dashboard"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <Feather name="home" size={24} color={color} />
            ),
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: "Create",
            tabBarIcon: ({ color }) => (
              <Feather name="plus" size={24} color={color} />
            ),
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => (
              <Feather name="user" size={24} color={color} />
            ),
            headerShown: false,
          }}
        />
      </Tabs>
    </UserProvider>
  );
}
