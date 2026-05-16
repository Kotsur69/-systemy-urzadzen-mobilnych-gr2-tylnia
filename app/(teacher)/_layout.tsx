import { Redirect, Stack } from "expo-router";
import { localAuth } from "@/src/services/localAuth";

export const unstable_settings = {
  initialRouteName: "teacher",
};

export default function TeacherTabLayout() {
  const user = localAuth.currentUser;

  if (!user || user.role !== "teacher") {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
