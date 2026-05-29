import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  Switch,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  getAllUsers,
  updateUserDataByUid,
  createNewUser,
  sendUserPasswordReset,
} from "@/src/services/userApi";
import UserData from "@/src/models/UserData";
import { UserRole } from "@/src/models/UserRole";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import SafeAreaContainer from "@/src/components/SafeAreaContainer";

const UserManagement = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtry
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");

  // Modal i Edycja/Dodawanie
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Formularz
  const initialFormState: UserData & { password?: string } = {
    uid: "",
    firstName: "",
    surname: "",
    role: "student",
    email: "",
    active: true,
    password: "",
    specialty: "",
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchText, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error: any) {
      alert("Błąd pobierania: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let result = users;
    if (searchText) {
      result = result.filter(
        (u) =>
          u.surname.toLowerCase().includes(searchText.toLowerCase()) ||
          u.email.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    if (roleFilter !== "all") {
      result = result.filter((u) => u.role === roleFilter);
    }
    setFilteredUsers(result);
  };

  const openEditModal = (user: UserData) => {
    setIsEditing(true);
    setFormData({ ...user, password: "" });
    setModalVisible(true);
  };

  const openAddModal = () => {
    setIsEditing(false);
    setFormData(initialFormState);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.email || !formData.surname || !formData.firstName) {
      alert("Uzupełnij wymagane pola (Imię, Nazwisko, Email)");
      return;
    }

    try {
      if (isEditing) {
        await updateUserDataByUid(formData.uid, formData);
        alert("Zaktualizowano pomyślnie");
      } else {
        if (!formData.password || formData.password.length < 6) {
          alert("Hasło musi mieć min. 6 znaków");
          return;
        }
        await createNewUser(formData, formData.password);
        alert("Utworzono użytkownika");
      }
      setModalVisible(false);
      fetchUsers();
    } catch (error: any) {
      alert("Błąd: " + error.message);
    }
  };

  const handlePasswordReset = async () => {
    if (!formData.email) return;
    try {
      await sendUserPasswordReset(formData.email);
      alert(`Wysłano link resetujący na ${formData.email}`);
    } catch (error: any) {
      alert("Błąd wysyłania: " + error.message);
    }
  };

  const renderUserItem = ({ item }: { item: UserData }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => openEditModal(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.userName}>
          {item.surname} {item.firstName}
        </Text>
        <View
          style={[
            styles.roleBadge,
            {
              backgroundColor:
                item.role === "admin"
                  ? "#E91E63"
                  : item.role === "teacher"
                  ? "#FF9800"
                  : item.role === "parent"
                  ? "#26A69A"
                  : "#4CAF50",
            },
          ]}
        >
          <Text style={styles.roleText}>{item.role}</Text>
        </View>
      </View>
      <Text style={styles.userEmail}>{item.email}</Text>
      {item.role === "teacher" && item.specialty ? (
        <Text style={styles.specialtyText}>📚 {item.specialty}</Text>
      ) : null}
      {item.role === "parent" ? (
        <Text style={styles.specialtyText}>
          👪 Dzieci: {item.childIds?.length ?? 0}
        </Text>
      ) : null}
      <Text
        style={[
          styles.statusText,
          { color: item.active ? "#4CAF50" : "#E53935" },
        ]}
      >
        {item.active ? "● Aktywne" : "● Nieaktywne"}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaContainer>
      {/* HEADER */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={28} color="#1A237E" />
        </TouchableOpacity>
        <Text style={styles.title}>Użytkownicy</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <MaterialIcons name="add" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* FILTRY */}
      <View style={styles.filtersContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Szukaj (nazwisko lub email)..."
          value={searchText}
          onChangeText={setSearchText}
        />
        <View style={styles.chipsRow}>
          {(["all", "student", "teacher", "admin", "parent"] as const).map((role) => (
            <TouchableOpacity
              key={role}
              style={[styles.chip, roleFilter === role && styles.chipActive]}
              onPress={() => setRoleFilter(role)}
            >
              <Text
                style={[
                  styles.chipText,
                  roleFilter === role && styles.chipTextActive,
                ]}
              >
                {role === "all" ? "Wszyscy" : role}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* LISTA */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#5C6BC0"
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.uid}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Brak użytkowników.</Text>
          }
        />
      )}

      {/* MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <Text style={styles.modalTitle}>
                {isEditing ? "Edycja Użytkownika" : "Nowy Użytkownik"}
              </Text>

              <Text style={styles.label}>Imię</Text>
              <TextInput
                style={styles.input}
                value={formData.firstName}
                onChangeText={(t) => setFormData({ ...formData, firstName: t })}
                placeholder=""
              />

              <Text style={styles.label}>Nazwisko</Text>
              <TextInput
                style={styles.input}
                value={formData.surname}
                onChangeText={(t) => setFormData({ ...formData, surname: t })}
                placeholder=""
              />

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, isEditing && styles.readOnlyInput]}
                value={formData.email}
                onChangeText={(t) => setFormData({ ...formData, email: t })}
                editable={!isEditing}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder=""
              />

              {!isEditing && (
                <>
                  <Text style={styles.label}>Hasło (min. 6 znaków)</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.password}
                    onChangeText={(t) =>
                      setFormData({ ...formData, password: t })
                    }
                    secureTextEntry
                    placeholder=""
                  />
                </>
              )}

              {isEditing && (
                <TouchableOpacity
                  style={styles.resetContainer}
                  onPress={handlePasswordReset}
                >
                  <MaterialIcons name="lock-reset" size={24} color="#FF9800" />
                  <Text style={styles.resetText}>
                    Wyślij e-mail do resetu hasła
                  </Text>
                </TouchableOpacity>
              )}

              <Text style={styles.label}>Rola</Text>
              <View style={styles.roleSelectContainer}>
                {(["student", "teacher", "admin", "parent"] as UserRole[]).map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.roleOption,
                      formData.role === r && styles.roleOptionActive,
                    ]}
                    onPress={() => setFormData({ ...formData, role: r })}
                  >
                    <Text
                      style={[
                        styles.roleOptionText,
                        formData.role === r && styles.roleOptionTextActive,
                      ]}
                    >
                      {r}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {formData.role === "teacher" && (
                <>
                  <Text style={styles.label}>Przedmiot / Specjalizacja</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.specialty ?? ""}
                    onChangeText={(t) => setFormData({ ...formData, specialty: t })}
                    placeholder="np. Matematyka, Informatyka, Historia..."
                  />
                </>
              )}

              {formData.role === "parent" && (
                <>
                  <Text style={styles.label}>Dzieci (uczniowie)</Text>
                  {users.filter((u) => u.role === "student").length === 0 ? (
                    <Text style={styles.childHint}>Brak uczniów do przypisania.</Text>
                  ) : (
                    users
                      .filter((u) => u.role === "student")
                      .map((s) => {
                        const checked = (formData.childIds ?? []).includes(s.uid);
                        return (
                          <TouchableOpacity
                            key={s.uid}
                            style={styles.childRow}
                            onPress={() => {
                              const current = formData.childIds ?? [];
                              const next = checked
                                ? current.filter((id) => id !== s.uid)
                                : [...current, s.uid];
                              setFormData({ ...formData, childIds: next });
                            }}
                          >
                            <View
                              style={[
                                styles.childCheckbox,
                                checked && styles.childCheckboxChecked,
                              ]}
                            >
                              {checked && (
                                <MaterialIcons name="check" size={16} color="#FFF" />
                              )}
                            </View>
                            <Text style={styles.childLabel}>
                              {s.firstName} {s.surname}
                            </Text>
                          </TouchableOpacity>
                        );
                      })
                  )}
                </>
              )}

              <View style={styles.switchContainer}>
                <Text style={styles.labelLarge}>Konto Aktywne</Text>
                <Switch
                  value={formData.active}
                  onValueChange={(val) =>
                    setFormData({ ...formData, active: val })
                  }
                  trackColor={{ false: "#767577", true: "#81b0ff" }}
                  thumbColor={formData.active ? "#5C6BC0" : "#f4f3f4"}
                  style={{ transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] }} // Powiększony switch
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.cancelBtn]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.btnText}>Anuluj</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.saveBtn]}
                  onPress={handleSave}
                >
                  <Text style={styles.btnText}>Zapisz</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaContainer>
  );
};

export default UserManagement;

const styles = StyleSheet.create({
  // Header
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#E0E0E0",
  },
  backButton: { padding: 5 },
  addButton: { backgroundColor: "#5C6BC0", padding: 10, borderRadius: 25 },
  title: { fontSize: 24, fontWeight: "800", color: "#1A237E" },

  // Filtry
  filtersContainer: {
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#E0E0E0",
  },
  searchInput: {
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 12,
  },
  chipsRow: { flexDirection: "row", justifyContent: "space-between" },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 25,
    backgroundColor: "#EEEEEE",
  },
  chipActive: { backgroundColor: "#5C6BC0" },
  chipText: { color: "#616161", fontSize: 13, fontWeight: "600" },
  chipTextActive: { color: "#FFF" },

  // Lista
  listContent: { padding: 15 },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#757575",
    fontSize: 16,
  },

  // Karty Użytkowników
  userCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  userName: { fontSize: 18, fontWeight: "bold", color: "#333" },
  userEmail: { fontSize: 15, color: "#666", marginBottom: 6 },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  roleText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  statusText: { fontSize: 13, fontWeight: "600", marginTop: 5 },
  specialtyText: { fontSize: 13, color: "#5C6BC0", fontWeight: "600", marginBottom: 4 },
  childHint: { fontSize: 13, color: "#9E9E9E", marginTop: 4 },
  childRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
  },
  childCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#C5CAE9",
    alignItems: "center",
    justifyContent: "center",
  },
  childCheckboxChecked: { backgroundColor: "#5C6BC0", borderColor: "#5C6BC0" },
  childLabel: { fontSize: 16, color: "#333" },

  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    height: "92%", // Wyższy modal
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#1A237E",
  },

  // Formularz - Duże Pola
  label: {
    fontSize: 14,
    color: "#3949AB",
    fontWeight: "700",
    marginTop: 15,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  labelLarge: {
    fontSize: 16,
    color: "#3949AB",
    fontWeight: "700",
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    paddingVertical: 14, // Większy padding w pionie
    paddingHorizontal: 16,
    fontSize: 18, // Większa czcionka
    color: "#333",
  },
  readOnlyInput: {
    backgroundColor: "#F0F0F0",
    color: "#757575",
    borderColor: "#EEEEEE",
  },

  resetContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    gap: 12,
  },
  resetText: { color: "#E65100", fontWeight: "600", fontSize: 15 },

  roleSelectContainer: { flexDirection: "row", gap: 10, marginTop: 5 },
  roleOption: {
    flex: 1,
    paddingVertical: 12, // Wyższe przyciski ról
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    alignItems: "center",
  },
  roleOptionActive: { backgroundColor: "#5C6BC0", borderColor: "#5C6BC0" },
  roleOptionText: { color: "#757575", fontWeight: "600", fontSize: 14 },
  roleOptionTextActive: { color: "#FFF" },

  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 25,
    marginBottom: 10,
    backgroundColor: "#F5F5F5",
    padding: 15,
    borderRadius: 12,
  },

  modalButtons: {
    flexDirection: "row",
    gap: 15,
    marginTop: 30,
    marginBottom: 40,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 18, // Duże przyciski akcji
    borderRadius: 15,
    alignItems: "center",
    elevation: 2,
  },
  cancelBtn: { backgroundColor: "#BDBDBD" },
  saveBtn: { backgroundColor: "#4CAF50" },
  btnText: { color: "#FFF", fontWeight: "bold", fontSize: 18 },
});
