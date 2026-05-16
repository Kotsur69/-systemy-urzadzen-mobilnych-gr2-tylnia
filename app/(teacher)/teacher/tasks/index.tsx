import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import Task from "@/src/models/Task";
import {
  getTasksByTeacher,
  getStudents,
  Student,
} from "@/src/services/tasksApi";
import { localAuth } from "@/src/services/localAuth";

export default function TeacherTasksList() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentsByUid, setStudentsByUid] = useState<Record<string, Student>>({});

  const uid = localAuth.currentUser?.uid ?? "";

  const loadTasks = async () => {
    try {
      setLoading(true);
      const fetchedTasks = await getTasksByTeacher(uid);
      setTasks(fetchedTasks);
    } catch (error) {
      console.log("Błąd pobierania zadań:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const students = await getStudents();
      const map: Record<string, Student> = {};
      students.forEach((s) => { map[s.uid] = s; });
      setStudentsByUid(map);
    } catch (e) {
      console.log("Błąd pobierania studentów:", e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadStudents();
      loadTasks();
    }, [])
  );

  const handleTaskPress = (taskId: string) => {
    router.push({
      pathname: "/teacher/tasks/task",
      params: { id: taskId },
    });
  };

  const getStatusColor = (task: Task) => {
    if (task.commited) return "#10b981";
    if (task.rate !== null) return "#f59e0b";
    return "#ef4444";
  };

  const getStatusText = (task: Task) => {
    if (task.commited) return "Zatwierdzone";
    if (task.rate !== null) return "Ocenione";
    return "Do oceny";
  };

  const formatDatePL = (date?: string) => {
    if (!date) return "-";
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }); // 03.01.2025
  };

  const getStudentLabel = (studentId: string) => {
    const s = studentsByUid[studentId];
    return s ? `${s.firstName} ${s.surname}`.trim() || "(nieznany)" : "(nieznany)";
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Ładowanie zadań...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const pendingTasks = tasks.filter((t) => !t.commited);
  const completedTasks = tasks.filter((t) => t.commited);

  const handleCreateTask = () => {
    router.push("/teacher/tasks/create");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Moje Zadania</Text>
        <View style={styles.headerRow}>
          <Text style={styles.headerSubtitle}>
            {pendingTasks.length} do sprawdzenia
          </Text>
          <TouchableOpacity style={styles.addButton} onPress={handleCreateTask}>
            <Text style={styles.addButtonText}>+ Nowe</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* niezatwierdzone */}
        {pendingTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Do sprawdzenia</Text>
            {pendingTasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={styles.taskCard}
                onPress={() => handleTaskPress(task.id)}
                activeOpacity={0.7}
              >
                <View style={styles.taskHeader}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(task) },
                    ]}
                  >
                    <Text style={styles.statusText}>{getStatusText(task)}</Text>
                  </View>
                </View>

                <Text style={styles.taskStudent}>
                  Uczeń: {getStudentLabel(task.userId)}
                </Text>

                {task.rate !== null && (
                  <View style={styles.gradeContainer}>
                    <Text style={styles.gradeLabel}>Ocena:</Text>
                    <Text style={styles.gradeValue}>{task.rate}/100</Text>
                  </View>
                )}

                <View style={styles.taskFooter}>
                  <Text style={styles.taskDate}>{formatDatePL(task.date)}</Text>
                  <Text style={styles.viewDetails}>Zobacz szczegóły →</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* zatwierdzone */}
        {completedTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Zatwierdzone</Text>
            {completedTasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={[styles.taskCard, styles.completedCard]}
                onPress={() => handleTaskPress(task.id)}
                activeOpacity={0.7}
              >
                <View style={styles.taskHeader}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(task) },
                    ]}
                  >
                    <Text style={styles.statusText}>{getStatusText(task)}</Text>
                  </View>
                </View>

                <Text style={styles.taskStudent}>
                  Uczeń: {getStudentLabel(task.userId)}
                </Text>

                {task.rate !== null && (
                  <View style={styles.gradeContainer}>
                    <Text style={styles.gradeLabel}>Ocena:</Text>
                    <Text style={styles.gradeValue}>{task.rate}/100</Text>
                  </View>
                )}

                <View style={styles.taskFooter}>
                  <Text style={styles.taskDate}>{formatDatePL(task.date)}</Text>
                  <Text style={styles.viewDetails}>Zobacz szczegóły →</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {tasks.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Brak zadań do sprawdzenia</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  taskCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  completedCard: {
    opacity: 0.7,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0f172a",
    flex: 1,
    marginRight: 12,
    lineHeight: 24,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  taskStudent: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 12,
  },
  gradeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  gradeLabel: {
    fontSize: 14,
    color: "#64748b",
    marginRight: 8,
  },
  gradeValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3b82f6",
  },
  taskFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  taskDate: {
    fontSize: 13,
    color: "#94a3b8",
  },
  viewDetails: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#64748b",
    marginTop: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#94a3b8",
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  unauthorizedIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  unauthorizedTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 12,
  },
  unauthorizedText: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
});
