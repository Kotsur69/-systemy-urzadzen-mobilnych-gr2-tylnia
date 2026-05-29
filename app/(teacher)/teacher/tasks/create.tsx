import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { localAuth } from "@/src/services/localAuth";
import { createTaskForStudents, getStudents } from "@/src/services/tasksApi";
import { notify } from "@/src/services/notificationsApi";
import SafeAreaContainer from "@/src/components/SafeAreaContainer";

interface Student {
  uid: string;
  firstName: string;
  surname: string;
}

export default function TeacherTaskCreate() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [title, setTitle] = useState("");
  const [taskContent, setTaskContent] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showStudentPicker, setShowStudentPicker] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const getSelectedStudentName = () => {
    if (selectedStudents.length === 0) return "Wybierz uczniów...";
    if (selectedStudents.length === students.length && students.length > 0)
      return "Wszyscy uczniowie";
    if (selectedStudents.length === 1) {
      const s = students.find((st) => st.uid === selectedStudents[0]);
      return s ? `${s.firstName} ${s.surname}` : "1 uczeń";
    }
    return `Wybrano: ${selectedStudents.length}`;
  };

  const toggleStudent = (uid: string) => {
    setSelectedStudents((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  const toggleSelectAll = () => {
    setSelectedStudents((prev) =>
      prev.length === students.length ? [] : students.map((s) => s.uid)
    );
  };

  const loadStudents = async () => {
    try {
      setLoadingStudents(true);
      const data = await getStudents();
      setStudents(data);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert("Błąd", "Podaj tytuł zadania");
      return;
    }
    if (!taskContent.trim()) {
      Alert.alert("Błąd", "Podaj treść zadania");
      return;
    }
    if (selectedStudents.length === 0) {
      Alert.alert("Błąd", "Wybierz co najmniej jednego ucznia");
      return;
    }
    setIsSaving(true);

    try {
      const count = await createTaskForStudents({
        title: title.trim(),
        taskContent: taskContent.trim(),
        userIds: selectedStudents,
        teacherId: localAuth.currentUser?.uid ?? "",
      });

      notify(
        "Nowe zadanie domowe",
        `Dodano zadanie "${title.trim()}" dla ${count} ucznia(ów).`
      );

      Alert.alert(
        "Sukces",
        count === 1
          ? "Zadanie zostało utworzone"
          : `Zadanie zostało utworzone dla ${count} uczniów`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      console.error(error);
      Alert.alert("Błąd", "Nie udało się utworzyć zadania");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaContainer>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Anuluj</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nowe zadanie</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          {/* Tytuł */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tytuł zadania *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#94a3b8"
              maxLength={100}
            />
          </View>

          {/* Uczniowie */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Przypisz do uczniów *</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowStudentPicker(true)}
            >
              <Text
                style={[
                  styles.dropdownButtonText,
                  selectedStudents.length === 0 && styles.dropdownPlaceholder,
                ]}
              >
                {getSelectedStudentName()}
              </Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* Modal z listą studentów (wielokrotny wybór) */}
          <Modal
            visible={showStudentPicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowStudentPicker(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowStudentPicker(false)}
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Wybierz uczniów</Text>
                  <TouchableOpacity onPress={() => setShowStudentPicker(false)}>
                    <Text style={styles.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.selectAllRow}
                  onPress={toggleSelectAll}
                >
                  <Text style={styles.selectAllText}>
                    {selectedStudents.length === students.length &&
                    students.length > 0
                      ? "Odznacz wszystkich"
                      : "Zaznacz wszystkich"}
                  </Text>
                </TouchableOpacity>

                <FlatList
                  data={students}
                  keyExtractor={(item) => item.uid}
                  renderItem={({ item }) => {
                    const checked = selectedStudents.includes(item.uid);
                    return (
                      <TouchableOpacity
                        style={[
                          styles.studentItem,
                          checked && styles.studentItemSelected,
                        ]}
                        onPress={() => toggleStudent(item.uid)}
                      >
                        <Text
                          style={[
                            styles.studentItemText,
                            checked && styles.studentItemTextSelected,
                          ]}
                        >
                          {item.firstName} {item.surname}
                        </Text>
                        <View
                          style={[
                            styles.checkbox,
                            checked && styles.checkboxChecked,
                          ]}
                        >
                          {checked && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                      </TouchableOpacity>
                    );
                  }}
                />

                <TouchableOpacity
                  style={styles.modalDoneButton}
                  onPress={() => setShowStudentPicker(false)}
                >
                  <Text style={styles.modalDoneText}>
                    Gotowe ({selectedStudents.length})
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Treść zadania */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Treść zadania *</Text>
            <TextInput
              style={styles.textArea}
              value={taskContent}
              onChangeText={setTaskContent}
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />
          </View>

          {/* Przycisk */}
          <TouchableOpacity
            style={[
              styles.createButton,
              isSaving && styles.createButtonDisabled,
            ]}
            onPress={handleCreate}
            disabled={isSaving}
          >
            <Text style={styles.createButtonText}>
              {isSaving ? "Tworzenie..." : "Utwórz zadanie"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backBtn: {
    marginBottom: 8,
  },
  backBtnText: {
    fontSize: 16,
    color: "#3b82f6",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  form: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 2,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#0f172a",
  },
  pickerContainer: {
    backgroundColor: "#f8fafc",
    borderWidth: 2,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    color: "#0f172a",
  },
  textArea: {
    backgroundColor: "#f8fafc",
    borderWidth: 2,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: "#0f172a",
    minHeight: 150,
  },
  createButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#64748b",
    marginTop: 12,
  },
  errorText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ef4444",
    marginBottom: 12,
  },
  unauthorizedText: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  backButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  dropdownButton: {
    backgroundColor: "#f8fafc",
    borderWidth: 2,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownButtonText: {
    fontSize: 16,
    color: "#0f172a",
  },
  dropdownPlaceholder: {
    color: "#94a3b8",
  },
  dropdownArrow: {
    fontSize: 12,
    color: "#64748b",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  modalClose: {
    fontSize: 24,
    color: "#64748b",
    fontWeight: "300",
  },
  studentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  studentItemSelected: {
    backgroundColor: "#eff6ff",
  },
  studentItemText: {
    fontSize: 16,
    color: "#0f172a",
  },
  studentItemTextSelected: {
    color: "#3b82f6",
    fontWeight: "600",
  },
  checkmark: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "700",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  selectAllRow: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  selectAllText: {
    fontSize: 15,
    color: "#3b82f6",
    fontWeight: "600",
  },
  modalDoneButton: {
    backgroundColor: "#3b82f6",
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  modalDoneText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});
