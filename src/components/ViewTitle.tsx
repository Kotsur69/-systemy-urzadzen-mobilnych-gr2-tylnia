import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/src/context/ThemeContext";

export default function ViewTitle({
  children,
  back = false,
}: {
  children: React.ReactNode;
  back?: boolean;
}) {
  const router = useRouter();
  const { C } = useAppTheme();

  return (
    <View style={styles.container}>
      {back ? (
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={C.icon} />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}
      <Text style={[styles.heading, { color: C.text }]}>{children}</Text>
      <View style={styles.placeholder} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  backButton: {
    paddingLeft: 20,
    width: 50,
    zIndex: 10,
  },
  placeholder: {
    width: 50,
  },
});
