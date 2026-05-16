import { Redirect, Stack } from "expo-router";
import { localAuth } from "@/src/services/localAuth";

export default function StudentTabLayout() {
  const user = localAuth.currentUser;

  if (!user || user.role !== "student") {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
