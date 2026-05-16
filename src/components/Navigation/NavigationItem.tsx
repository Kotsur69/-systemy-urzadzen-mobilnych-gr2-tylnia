import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Route, useRouter } from "expo-router";

export type NavigationItemType = {
  label: string;
  desc: string;
  iconName: string;
  iconBackgroundColor?: string;
  route: Route;
};

type NavigationItemProps = NavigationItemType;

export default function NavigationItem({
  label,
  desc,
  iconName,
  iconBackgroundColor,
  route,
}: NavigationItemProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      key={label}
      style={styles.menuButton}
      onPress={() => router.push(route)}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: iconBackgroundColor || "#5C6BC0" },
        ]}
      >
        <MaterialIcons
          name={iconName as keyof typeof MaterialIcons.glyphMap}
          size={32}
          color="#FFFFFF"
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.buttonTitle}>{label}</Text>
        <Text style={styles.buttonDesc}>{desc}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#5C6BC0" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  menuContainer: {
    gap: 10,
  },
  menuButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E8EAF6",
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#5C6BC0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3C4858",
    marginBottom: 4,
  },
  buttonDesc: {
    fontSize: 12,
    color: "#757575",
  },
});
