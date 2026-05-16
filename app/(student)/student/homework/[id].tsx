import { useState, useCallback } from "react";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { submitTaskAnswer, getSingleTaskById } from "@/src/services/studentApi";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Text,
} from "react-native";
import SafeAreaContainer from "@/src/components/SafeAreaContainer";
import ViewTitle from "@/src/components/ViewTitle";
import Task from "@/src/models/Task";
import Loader from "@/src/components/Loader";

export default function HomeworkDetailsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState<Task | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [answerText, setAnswerText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchTaskDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const fetchedTask = await getSingleTaskById(id);

      if (fetchedTask) {
        setTask(fetchedTask);
        setAnswerText(fetchedTask.answerContent || "");
      } else {
        setTask(null);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Błąd", "Nie udało się pobrać szczegółów zadania.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTaskDetails();
    }, [id])
  );

  const handleSubmitAnswer = async () => {
    if (!task) return;

    if (!answerText.trim()) {
      Alert.alert("Uwaga", "Treść odpowiedzi nie może być pusta.");
      return;
    }

    setSubmitting(true);
    try {
      await submitTaskAnswer(task.id, answerText);
      Alert.alert("Sukces", "Odpowiedź została wysłana.");
      setModalVisible(false);
      fetchTaskDetails();
    } catch (error) {
      Alert.alert("Błąd", "Wystąpił błąd podczas wysyłania odpowiedzi.");
    } finally {
      setSubmitting(false);
    }
  };

  const dateFormatted = task?.date
    ? new Date(task?.date).toLocaleDateString()
    : "Brak daty";

  return (
    <SafeAreaContainer>
      <ViewTitle back>Szczegóły</ViewTitle>
      {loading && <Loader />}
      {!loading && !task && (
        <View style={styles.center}>
          <Text>Nie znaleziono zadania.</Text>
        </View>
      )}
      {!loading && task && (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>{task?.title}</Text>
          <View style={styles.headerCard}>
            <View style={styles.row}>
              <Text style={styles.label}>Nauczyciel:</Text>
              <Text style={styles.value}>{task?.teacherName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Data:</Text>
              <Text style={styles.value}>{dateFormatted}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Ocena:</Text>
              <View
                style={[styles.rateBadge, !task?.rate && styles.rateBadgeEmpty]}
              >
                <Text
                  style={[styles.rateText, !task?.rate && styles.rateTextEmpty]}
                >
                  {task?.rate !== null ? `${task?.rate}/100` : "Brak oceny"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Treść zadania</Text>
            <View style={styles.card}>
              <Text style={styles.textContent}>{task?.taskContent}</Text>
            </View>
          </View>

          {task?.comment ? (
            <View style={styles.section}>
              <Text style={[styles.sectionHeader]}>Komentarz nauczyciela</Text>
              <View style={[styles.card, styles.commentCard]}>
                <Text style={styles.textContent}>{task.comment}</Text>
              </View>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Twoja odpowiedź</Text>
            {task?.answerContent ? (
              <View style={[styles.card, styles.answerCard]}>
                <Text style={styles.textContent}>{task?.answerContent}</Text>
              </View>
            ) : (
              <Text style={styles.noAnswerText}>
                Nie przesłano jeszcze odpowiedzi.
              </Text>
            )}

            {!task?.commited && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setModalVisible(true)}
              >
                <Text style={styles.actionButtonText}>
                  {task?.answerContent
                    ? "Edytuj odpowiedź"
                    : "Wyślij odpowiedź"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      )}

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Odpowiedź na: {task?.title}</Text>

            <TextInput
              style={styles.input}
              multiline
              textAlignVertical="top"
              placeholder="Wpisz treść rozwiązania..."
              value={answerText}
              onChangeText={setAnswerText}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.btn, styles.btnCancel]}
                onPress={() => setModalVisible(false)}
                disabled={submitting}
              >
                <Text style={styles.btnTextCancel}>Anuluj</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.btnSubmit]}
                onPress={handleSubmitAnswer}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.btnTextSubmit}>Zapisz</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingHorizontal: 16,
  },
  headerCard: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingLeft: 6,
    color: "#4a4a4a",
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    flex: 1,
    fontWeight: "500",
    color: "#666",
  },
  value: {
    color: "#333",
  },
  rateBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  rateBadgeEmpty: {
    backgroundColor: "#f0f0f0",
  },
  rateText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  rateTextEmpty: {
    color: "#999",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#444",
    marginLeft: 4,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  textContent: {
    fontSize: 15,
    lineHeight: 22,
    color: "#333",
  },
  commentCard: {
    backgroundColor: "#e3f2fd",
    borderColor: "#bbdefb",
  },
  answerCard: {
    backgroundColor: "#f5f5f5",
    borderColor: "#eeeeee",
  },
  noAnswerText: {
    fontStyle: "italic",
    color: "#888",
    marginBottom: 10,
    marginLeft: 4,
  },
  actionButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    height: 150,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: "#f9f9f9",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  btnCancel: {
    backgroundColor: "#f5f5f5",
  },
  btnSubmit: {
    backgroundColor: "#2196F3",
  },
  btnTextCancel: {
    color: "#333",
    fontWeight: "600",
  },
  btnTextSubmit: {
    color: "#fff",
    fontWeight: "600",
  },
});
