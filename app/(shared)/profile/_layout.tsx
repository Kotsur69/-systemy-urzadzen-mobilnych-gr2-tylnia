import { Stack } from "expo-router";

export default function TasksLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Profil",
        }}
      />
      <Stack.Screen
        name="changePassword"
        options={{
          title: "Zmień hasło",
          headerShown: true,
        }}
      />
    </Stack>
  );
}
