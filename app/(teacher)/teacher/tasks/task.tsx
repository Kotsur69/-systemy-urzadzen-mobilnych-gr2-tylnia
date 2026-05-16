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
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import Task from "@/src/models/Task";
import {
  getTaskById,
  updateTaskGradeAndStatus,
  getStudentByUid,
  Student,
} from "@/src/services/tasksApi";

export default function TeacherTask() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [ocena, setOcena] = useState("");
  const [komentarz, setKomentarz] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);

  const formatDatePL = (date?: string) => {
    if (!date) return "-";
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  useEffect(() => {
    if (id) loadTask(id);
  }, [id]);

  const loadTask = async (taskId: string) => {
    try {
      const foundTask = await getTaskById(taskId);

      if (foundTask) {
        setTask(foundTask);
        setOcena(foundTask.rate !== null ? foundTask.rate.toString() : "");
        setKomentarz(foundTask.comment);

        const s = await getStudentByUid(foundTask.userId);
        setStudent(s);
      }
    } catch (error) {
      console.error("Error loading task:", error);
      Alert.alert("Błąd", "Nie udało się załadować zadania.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!task) return;

    const ocenaNum = ocena ? parseInt(ocena) : null;

    if (ocena && (isNaN(ocenaNum!) || ocenaNum! < 0 || ocenaNum! > 100)) {
      Alert.alert("Błąd", "Ocena musi być liczbą z zakresu 0-100");
      return;
    }

    setIsSaving(true);

    try {
      await updateTaskGradeAndStatus(task.id, ocenaNum, komentarz, false);

      setTask((prevTask) =>
        prevTask
          ? {
              ...prevTask,
              rate: ocenaNum,
              comment: komentarz,
              commited: false,
            }
          : null
      );

      Alert.alert("Sukces", "Ocena i komentarz zostały zapisane", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Błąd zapisywania:", error);
      Alert.alert("Błąd", "Nie udało się zapisać oceny i komentarza.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleApproveAction = async (ocenaNum: number) => {
    setIsSaving(true);

    if (!task) {
      setIsSaving(false);
      return;
    }

    try {
      await updateTaskGradeAndStatus(task.id, ocenaNum, komentarz, true);

      setTask((prevTask) =>
        prevTask
          ? {
              ...prevTask,
              rate: ocenaNum,
              comment: komentarz,
              commited: true,
            }
          : null
      );

      Alert.alert("Sukces", "Zadanie zostało zatwierdzone", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Błąd zatwierdzania:", error);
      Alert.alert(
        "Błąd",
        "Nie udało się zatwierdzić zadania. Sprawdź konsolę, czy API działa."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprove = () => {
    if (!task) return;

    const ocenaNum = parseInt(ocena);

    if (!ocena || isNaN(ocenaNum) || ocenaNum < 0 || ocenaNum > 100) {
      Alert.alert(
        "Błąd",
        "Musisz wystawić ocenę w zakresie 0-100 przed zatwierdzeniem"
      );
      return;
    }

    try {
      handleApproveAction(ocenaNum);

      Alert.alert("Sukces", "Zadanie zostało zatwierdzone", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Błąd zatwierdzania:", error);
      Alert.alert(
        "Błąd",
        "Nie udało się zatwierdzić zadania. Sprawdź konsolę, czy API działa."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Ładowanie zadania...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!task) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Nie znaleziono zadania</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Powrót</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Text style={styles.backBtnText}>← Powrót</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Szczegóły zadania</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Status Badge */}
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: task.commited
                    ? "#10b981"
                    : task.rate !== null
                    ? "#f59e0b"
                    : "#ef4444",
                },
              ]}
            >
              <Text style={styles.statusText}>
                {task.commited
                  ? "ZATWIERDZONE"
                  : task.rate !== null
                  ? "OCENIONE"
                  : "DO OCENY"}
              </Text>
            </View>
          </View>

          {/* Tytuł zadania */}
          <View style={styles.titleCard}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={styles.taskMeta}>
              Uczeń:{" "}
              {student
                ? `${student.firstName} ${student.surname}`.trim()
                : "(nieznany)"}
            </Text>
            <Text style={styles.taskMeta}>Data: {formatDatePL(task.date)}</Text>
          </View>

          {/* Treść zadania */}
          <View style={styles.contentCard}>
            <Text style={styles.sectionTitle}>Treść zadania</Text>
            <Text style={styles.contentText}>{task.taskContent}</Text>
          </View>

          {/* Odpowiedź ucznia */}
          <View style={styles.contentCard}>
            <Text style={styles.sectionTitle}>Odpowiedź ucznia</Text>
            <Text style={styles.contentText}>{task.answerContent}</Text>
          </View>

          {/* Formularz oceny */}
          <View style={styles.gradeCard}>
            <Text style={styles.gradeCardTitle}>Ocenianie</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ocena (0-100)</Text>
              <TextInput
                style={styles.gradeInput}
                value={ocena}
                onChangeText={setOcena}
                placeholder="Wpisz ocenę"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
                maxLength={3}
                editable={!task.commited}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Komentarz</Text>
              <TextInput
                style={styles.commentInput}
                value={komentarz}
                onChangeText={setKomentarz}
                placeholder="Dodaj komentarz do pracy ucznia..."
                placeholderTextColor="#64748b"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                editable={!task.commited}
              />
            </View>

            {!task.commited && (
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSave}
                  disabled={isSaving}
                >
                  <Text style={styles.buttonText}>
                    {isSaving ? "Zapisywanie..." : "Zapisz"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.approveButton]}
                  onPress={handleApprove}
                  disabled={isSaving}
                >
                  <Text style={styles.buttonText}>
                    {isSaving ? "Zatwierdzanie..." : "Zatwierdź"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {task.commited && (
              <View style={styles.approvedInfo}>
                <Text style={styles.approvedText}>Zatwierdzone</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  keyboardView: {
    flex: 1,
  },
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
  statusContainer: {
    alignItems: "flex-start",
    marginBottom: 20,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  statusText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  titleCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  taskTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 12,
    lineHeight: 32,
  },
  taskMeta: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
  },
  contentCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  contentText: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 24,
  },
  gradeCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#3b82f6",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  gradeCardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#3b82f6",
    marginBottom: 20,
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
  gradeInput: {
    backgroundColor: "#f8fafc",
    borderWidth: 2,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: "#0f172a",
    fontWeight: "600",
  },
  commentInput: {
    backgroundColor: "#f8fafc",
    borderWidth: 2,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: "#0f172a",
    minHeight: 120,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButton: {
    backgroundColor: "#64748b",
  },
  approveButton: {
    backgroundColor: "#10b981",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  approvedInfo: {
    backgroundColor: "#d1fae5",
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#10b981",
  },
  approvedText: {
    color: "#065f46",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
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
});
