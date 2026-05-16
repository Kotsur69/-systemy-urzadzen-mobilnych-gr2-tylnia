import { useState, useEffect } from "react";
import { router } from "expo-router";
import {
  getCurrentUserData,
  updateCurrentUserData,
} from "@/src/services/userApi";
import { localAuth, signOut } from "@/src/services/localAuth";
import type UserData from "@/src/models/UserData";
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  View,
  Switch,
} from "react-native";
import ProfileInfo from "@/src/components/Profile/ProfileInfo";
import EditProfile from "@/src/components/Profile/EditProfile";
import ViewTitle from "@/src/components/ViewTitle";
import SafeAreaContainer from "@/src/components/SafeAreaContainer";
import { useAppTheme } from "@/src/context/ThemeContext";

const Profile = () => {
  const { C, isDark, toggle } = useAppTheme();
  const authUser = localAuth.currentUser;
  const [userData, setUserData] = useState<UserData>(
    authUser ?? {
      firstName: "Anonymous",
      surname: "Anonymous",
      role: "guest",
      email: "-",
      uid: "-",
      active: true,
    }
  );
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!authUser) return;
    getCurrentUserData()
      .then(setUserData)
      .catch((err) => console.log("Error loading user profile:", err));
  }, []);

  const handleSave = async (updatedData: UserData) => {
    try {
      if (userData.role === "guest") {
        setUserData(updatedData);
        setIsEditing(false);
        return;
      }
      await updateCurrentUserData({
        firstName: updatedData.firstName,
        surname: updatedData.surname,
      });
      setUserData(updatedData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <SafeAreaContainer>
      <ViewTitle back>Profil</ViewTitle>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isEditing ? (
          <EditProfile
            userData={userData}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <ProfileInfo userData={userData} />
        )}

        {/* Dark mode toggle */}
        <View style={[styles.themeRow, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Text style={[styles.themeLabel, { color: C.text }]}>
            {isDark ? "🌙 Ciemny motyw" : "☀️ Jasny motyw"}
          </Text>
          <Switch
            value={isDark}
            onValueChange={toggle}
            trackColor={{ false: "#e2e8f0", true: "#3b82f6" }}
            thumbColor={isDark ? "#ffffff" : "#ffffff"}
          />
        </View>

        {!isEditing && (
          <View style={styles.buttonView}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.buttonText}>Edytuj profil</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                userData.role === "guest"
                  ? styles.backToLoginButton
                  : styles.logoutButton,
              ]}
              onPress={handleLogout}
            >
              <Text style={styles.buttonText}>
                {userData.role === "guest"
                  ? "Powrót do logowania"
                  : "Wyloguj się"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: { padding: 16, gap: 16 },
  themeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  themeLabel: { fontSize: 16, fontWeight: "600" },
  buttonView: { gap: 12 },
  button: {
    backgroundColor: "#4a90e2",
    borderRadius: 8,
    height: 45,
    justifyContent: "center",
  },
  logoutButton: { backgroundColor: "#e74c3c" },
  backToLoginButton: { backgroundColor: "#785f30" },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default Profile;
