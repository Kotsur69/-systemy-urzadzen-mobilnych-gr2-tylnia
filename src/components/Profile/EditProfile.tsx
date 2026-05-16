import {
  Text,
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import UserData from "@/src/models/UserData";
import { UserRole } from "@/src/models/UserRole";
import { router } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";

interface EditProfileProps {
  userData: UserData;
  onSave: (data: UserData) => void;
  onCancel: () => void;
}

const EditProfile = ({ userData, onSave, onCancel }: EditProfileProps) => {
  const [formData, setFormData] = useState(userData);
  const roles: UserRole[] = ["student", "teacher", "admin"];

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Imię</Text>
        <TextInput
          style={styles.textInput}
          placeholder="First Name"
          value={formData.firstName}
          onChangeText={(text) => setFormData({ ...formData, firstName: text })}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nazwisko</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Surname"
          value={formData.surname}
          onChangeText={(text) => setFormData({ ...formData, surname: text })}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email (z Firebase Auth)</Text>
        <View style={styles.readOnlyField}>
          <Text style={styles.readOnlyText}>{formData.email}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.actionRow}
        onPress={() => router.push("/profile/changePassword")}
      >
        <View style={styles.actionIcon}>
          <FontAwesome name="lock" size={20} color="#5C6BC0" />
        </View>

        <Text style={styles.actionText}>Zmień hasło</Text>
      </TouchableOpacity>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
        >
          <Text style={styles.buttonText}>Zapisz</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
        >
          <Text style={styles.buttonText}>Anuluj</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7E57C2",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  textInput: {
    height: 50,
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderColor: "#E8EAF6",
    borderWidth: 2,
    borderRadius: 15,
    paddingHorizontal: 20,
    fontSize: 16,
    color: "#3C4858",
    shadowColor: "#9E9E9E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  readOnlyField: {
    height: 50,
    width: "100%",
    backgroundColor: "#F5F5F5",
    borderColor: "#E0E0E0",
    borderWidth: 2,
    borderRadius: 15,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  readOnlyText: {
    fontSize: 16,
    color: "#757575",
  },
  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  roleButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderColor: "#E8EAF6",
    borderWidth: 2,
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    shadowColor: "#9E9E9E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  roleButtonActive: {
    backgroundColor: "#5C6BC0",
    borderColor: "#5C6BC0",
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3C4858",
  },
  roleButtonTextActive: {
    color: "#FFFFFF",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 15,
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
  saveButton: {
    backgroundColor: "#5C6BC0",
    shadowColor: "#5C6BC0",
  },
  cancelButton: {
    backgroundColor: "#757575",
    shadowColor: "#757575",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#EEF2FF",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E0E7FF",
    shadowColor: "#5C6BC0",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E0E7FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  actionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A237E",
  },
});
