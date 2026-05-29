import { Redirect } from "expo-router";
import type { Href } from "expo-router";
import { localAuth } from "@/src/services/localAuth";

export default function Index() {
  const user = localAuth.currentUser;

  if (!user) return <Redirect href="/auth" />;

  const roleRoutes: Record<string, string> = {
    student: "/(student)/student",
    teacher: "/(teacher)/teacher",
    admin: "/(admin)/admin",
    parent: "/(parent)/parent",
  };

  const route = (user.role ? roleRoutes[user.role] : undefined) ?? "/(guest)/guest";
  return <Redirect href={route as Href} />;
}
