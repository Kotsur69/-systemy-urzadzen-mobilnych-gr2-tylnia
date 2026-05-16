import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { initAuth } from "@/src/services/localAuth";
import {
  ThemeProvider,
  useAppTheme,
} from "@/src/context/ThemeContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../src/assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    initAuth().then(() => setAuthReady(true));
  }, []);

  useEffect(() => {
    if (loaded && authReady) {
      SplashScreen.hideAsync();
    }
  }, [loaded, authReady]);

  if (!loaded || !authReady) {
    return null;
  }

  return (
    <ThemeProvider>
      <RootLayoutNav />
    </ThemeProvider>
  );
}

function NavigationThemeWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isDark } = useAppTheme();
  return (
    <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      {children}
    </NavigationThemeProvider>
  );
}

function RootLayoutNav() {
  return (
    <NavigationThemeWrapper>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="(student)" />
        <Stack.Screen name="(teacher)" />
        <Stack.Screen name="(admin)" />
      </Stack>
    </NavigationThemeWrapper>
  );
}
