import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Task from "@/src/models/Task";
import { Ionicons } from "@expo/vector-icons";

interface SingleHomeworkProps {
  task: Task;
  onPressAnswer: (task: Task) => void;
}

export default function SingleHomework({
  task,
  onPressAnswer,
}: SingleHomeworkProps) {
  const isSent = !!task.answerContent;
  const isCommited = !!task.commited;

  const dateFormatted = task.date
    ? new Date(task.date).toLocaleDateString()
    : "Brak daty";

  return (
    <TouchableOpacity onPress={() => onPressAnswer(task)} activeOpacity={0.7}>
      <View style={styles.container}>
        <View style={styles.contentRow}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.title} numberOfLines={1}>
              {task.title}
            </Text>
            <Text style={styles.subtitle}>
              {task.teacherName} • {dateFormatted}
            </Text>
            {task.teacherSpecialty ? (
              <View style={styles.specialtyBadge}>
                <Text style={styles.specialtyText}>{task.teacherSpecialty}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.rightSide}>
            {isCommited ? (
              <View style={styles.statusBadge}>
                <Ionicons
                  name="checkmark-done-circle"
                  size={14}
                  color="#1976D2"
                />
                <Text style={styles.statusText}>Zatwierdzone</Text>
              </View>
            ) : isSent ? (
              <View style={styles.statusBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
                <Text style={styles.statusText}>Wysłane</Text>
              </View>
            ) : (
              <View style={[styles.statusBadge, styles.statusBadgeTodo]}>
                <Ionicons name="time" size={14} color="#FF9800" />
                <Text style={[styles.statusText, styles.statusTextTodo]}>
                  Do zrobienia
                </Text>
              </View>
            )}

            <View style={styles.rateContainer}>
              <Text style={styles.rateText}>
                {task.rate !== null ? task.rate : "-"}/100
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  contentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
  },
  specialtyBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#EDE7F6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  specialtyText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#5C6BC0",
  },
  rightSide: {
    alignItems: "flex-end",
    gap: 6,
  },
  rateContainer: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 50,
    alignItems: "center",
  },
  rateText: {
    fontWeight: "bold",
    fontSize: 12,
    color: "#333",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    color: "#2E7D32",
    fontWeight: "600",
  },
  statusBadgeTodo: {
    backgroundColor: "#FFF3E0",
  },
  statusTextTodo: {
    color: "#EF6C00",
  },
});
