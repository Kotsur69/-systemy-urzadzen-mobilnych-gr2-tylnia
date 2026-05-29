import { Redirect, Stack } from "expo-router";
import { localAuth } from "@/src/services/localAuth";

export default function ParentGroupLayout() {
  const user = localAuth.currentUser;

  if (!user || user.role !== "parent") {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
