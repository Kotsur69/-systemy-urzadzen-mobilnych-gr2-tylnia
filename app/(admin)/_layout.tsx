import Colors from "@/src/constants/Colors";
import { useColorScheme } from "@/src/hooks/useColorScheme";
import { TabBarIcon } from "@/src/components/TabBarIcon";
import { Redirect, Tabs } from "expo-router";
import { localAuth } from "@/src/services/localAuth";

export default function AdminTabLayout() {
  const colorScheme = useColorScheme();
  const user = localAuth.currentUser;

  if (!user || user.role !== "admin") {
    return <Redirect href="/" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="admin/index"
        options={{
          title: "Panel",
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="admin/users"
        options={{
          title: "Użytkownicy",
          tabBarIcon: ({ color }) => <TabBarIcon name="users" color={color} />,
        }}
      />
      <Tabs.Screen
        name="admin/subjects"
        options={{
          title: "Przedmioty",
          tabBarIcon: ({ color }) => <TabBarIcon name="book" color={color} />,
        }}
      />
      <Tabs.Screen
        name="admin/profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
