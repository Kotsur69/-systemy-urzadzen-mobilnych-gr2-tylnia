import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useFocusEffect } from "expo-router";
import SafeAreaContainer from "@/src/components/SafeAreaContainer";
import ViewTitle from "@/src/components/ViewTitle";
import { localAuth } from "@/src/services/localAuth";
import { localDb, type StoredTask } from "@/src/services/localDb";
import { getAllSubjects, type Subject } from "@/src/services/subjectsApi";
import { useAppTheme } from "@/src/context/ThemeContext";

function gradeColor(rate: number | null) {
  if (rate === null) return "#94a3b8";
  if (rate >= 80) return "#10b981";
  if (rate >= 60) return "#f59e0b";
  return "#ef4444";
}

function gradeLabel(rate: number | null) {
  if (rate === null) return "—";
  if (rate >= 90) return "Celujący";
  if (rate >= 75) return "Bardzo dobry";
  if (rate >= 60) return "Dobry";
  if (rate >= 45) return "Dostateczny";
  return "Niedostateczny";
}

export default function ReportScreen() {
  const { C } = useAppTheme();
  const me = localAuth.currentUser!;
  const [tasks, setTasks] = useState<StoredTask[]>([]);
  const [subjects, setSubjects] = useState<Record<string, Subject>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [t, subs] = await Promise.all([
      localDb.tasks.getByUserId(me.uid),
      getAllSubjects(),
    ]);
    const subMap: Record<string, Subject> = {};
    subs.forEach((s) => { subMap[s.id] = s; });
    setTasks(t.filter((tk) => tk.commited));
    setSubjects(subMap);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const graded = tasks.filter((t) => t.rate !== null);
  const avg = graded.length
    ? Math.round(graded.reduce((sum, t) => sum + (t.rate ?? 0), 0) / graded.length)
    : null;

  return (
    <SafeAreaContainer>
      <ViewTitle back>Raport Ocen</ViewTitle>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={C.primary} size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Summary card */}
          <View style={[styles.summaryCard, { backgroundColor: C.surface, borderColor: C.border }]}>
            <Text style={[styles.summaryTitle, { color: C.text }]}>Podsumowanie</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNum, { color: C.primary }]}>{tasks.length}</Text>
                <Text style={[styles.summaryLabel, { color: C.textSub }]}>Ocenionych</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: C.border }]} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNum, { color: avg !== null ? gradeColor(avg) : C.textSub }]}>
                  {avg ?? "—"}
                </Text>
                <Text style={[styles.summaryLabel, { color: C.textSub }]}>Średnia</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: C.border }]} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNum, { color: C.success }]}>
                  {graded.filter((t) => (t.rate ?? 0) >= 60).length}
                </Text>
                <Text style={[styles.summaryLabel, { color: C.textSub }]}>Zaliczonych</Text>
              </View>
            </View>
          </View>

          {/* Task list */}
          {tasks.length === 0 ? (
            <View style={styles.center}>
              <Text style={{ fontSize: 36 }}>📋</Text>
              <Text style={[{ color: C.textSub, marginTop: 12, fontSize: 15 }]}>
                Brak zatwierdzonych ocen
              </Text>
            </View>
          ) : (
            tasks.map((task) => {
              const sub = task.subjectId ? subjects[task.subjectId] : null;
              const color = gradeColor(task.rate);
              return (
                <View
                  key={task.id}
                  style={[styles.taskCard, { backgroundColor: C.surface, borderColor: C.border }]}
                >
                  {sub && <View style={[styles.subjectBar, { backgroundColor: sub.color }]} />}
                  <View style={styles.taskBody}>
                    <View style={styles.taskTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.taskTitle, { color: C.text }]}>{task.title}</Text>
                        {sub && (
                          <Text style={[styles.taskSubject, { color: sub.color }]}>{sub.name}</Text>
                        )}
                      </View>
                      <View style={[styles.gradeBox, { backgroundColor: color + "20" }]}>
                        <Text style={[styles.gradeNum, { color }]}>
                          {task.rate !== null ? task.rate : "—"}
                        </Text>
                        <Text style={[styles.gradeMax, { color: C.textSub }]}>/100</Text>
                      </View>
                    </View>
                    <Text style={[styles.gradeLabel, { color }]}>{gradeLabel(task.rate)}</Text>
                    {task.comment ? (
                      <Text style={[styles.comment, { color: C.textSub, borderTopColor: C.border }]}>
                        💬 {task.comment}
                      </Text>
                    ) : null}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 40 },
  scroll: { padding: 16, gap: 12, paddingBottom: 32 },
  summaryCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: { fontSize: 16, fontWeight: "700", marginBottom: 16 },
  summaryRow: { flexDirection: "row", alignItems: "center" },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryNum: { fontSize: 32, fontWeight: "800" },
  summaryLabel: { fontSize: 12, marginTop: 2 },
  divider: { width: 1, height: 40 },
  taskCard: {
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  subjectBar: { width: 5 },
  taskBody: { flex: 1, padding: 14 },
  taskTop: { flexDirection: "row", alignItems: "flex-start", marginBottom: 4 },
  taskTitle: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  taskSubject: { fontSize: 12, fontWeight: "600" },
  gradeBox: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, flexDirection: "row", alignItems: "baseline", gap: 2 },
  gradeNum: { fontSize: 24, fontWeight: "800" },
  gradeMax: { fontSize: 12 },
  gradeLabel: { fontSize: 13, fontWeight: "600", marginBottom: 4 },
  comment: { fontSize: 13, marginTop: 8, paddingTop: 8, borderTopWidth: 1, fontStyle: "italic" },
});
