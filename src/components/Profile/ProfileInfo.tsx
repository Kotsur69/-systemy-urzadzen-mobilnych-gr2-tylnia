import { Text, StyleSheet, View } from "react-native";
import React from "react";
import UserData from "@/src/models/UserData";
import { UserRole } from "@/src/models/UserRole";

interface ProfileInfoProps {
  userData: UserData;
}

const ProfileInfo = ({ userData }: ProfileInfoProps) => {
  const getRoleDisplay = (role: UserRole) => {
    if (!role) return "Unknown";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "#E91E63";
      case "teacher":
        return "#FF9800";
      case "student":
        return "#4CAF50";
      default:
        return "#757575";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.infoCard}>
        <Text style={styles.label}>Imię</Text>
        <Text style={styles.value}>{userData.firstName}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.label}>Nazwisko</Text>
        <Text style={styles.value}>{userData.surname}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.label}>Rola</Text>
        <View
          style={[
            styles.roleBadge,
            { backgroundColor: getRoleBadgeColor(userData.role) },
          ]}
        >
          <Text style={styles.roleText}>{getRoleDisplay(userData.role)}</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{userData.email}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.label}>User ID</Text>
        <Text style={[styles.value, styles.uidText]}>{userData.uid}</Text>
      </View>
    </View>
  );
};

export default ProfileInfo;

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderColor: "#E8EAF6",
    borderWidth: 2,
    shadowColor: "#9E9E9E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7E57C2",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 18,
    fontWeight: "500",
    color: "#3C4858",
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  roleText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  uidText: {
    fontSize: 12,
    fontFamily: "monospace",
  },
});
