import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useFocusEffect } from "expo-router";
import SafeAreaContainer from "@/src/components/SafeAreaContainer";
import ViewTitle from "@/src/components/ViewTitle";
import { localDb, type StoredTask } from "@/src/services/localDb";
import { getAllSubjects, type Subject } from "@/src/services/subjectsApi";
import { getAllUsers } from "@/src/services/userApi";
import UserData from "@/src/models/UserData";
import { useAppTheme } from "@/src/context/ThemeContext";

function gradeLabel(rate: number): string {
  if (rate >= 90) return "Celujący";
  if (rate >= 75) return "Bardzo dobry";
  if (rate >= 60) return "Dobry";
  if (rate >= 45) return "Dostateczny";
  return "Niedostateczny";
}

type StudentStat = {
  student: UserData;
  tasks: StoredTask[];
  avg: number | null;
  passed: number;
};

export default function StatisticsScreen() {
  const { C } = useAppTheme();
  const [tasks, setTasks] = useState<StoredTask[]>([]);
  const [subjects, setSubjects] = useState<Record<string, Subject>>({});
  const [studentStats, setStudentStats] = useState<StudentStat[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [allTasks, subs, users] = await Promise.all([
      localDb.tasks.getAll(),
      getAllSubjects(),
      getAllUsers(),
    ]);

    const subMap: Record<string, Subject> = {};
    subs.forEach((s) => { subMap[s.id] = s; });
    setSubjects(subMap);

    const committed = allTasks.filter((t) => t.commited);
    setTasks(committed);

    const students = users.filter((u: UserData) => u.role === "student" && u.active);
    const stats: StudentStat[] = students.map((student: UserData) => {
      const st = committed.filter((t) => t.userId === student.uid);
      const graded = st.filter((t) => t.rate !== null);
      const avg = graded.length
        ? Math.round(graded.reduce((sum, t) => sum + (t.rate ?? 0), 0) / graded.length)
        : null;
      const passed = graded.filter((t) => (t.rate ?? 0) >= 60).length;
      return { student, tasks: st, avg, passed };
    });
    setStudentStats(stats);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const graded = tasks.filter((t) => t.rate !== null);
  const totalAvg = graded.length
    ? Math.round(graded.reduce((sum, t) => sum + (t.rate ?? 0), 0) / graded.length)
    : null;

  const dist = [
    { label: "90-100", count: graded.filter((t) => (t.rate ?? 0) >= 90).length, color: "#10b981" },
    { label: "75-89", count: graded.filter((t) => (t.rate ?? 0) >= 75 && (t.rate ?? 0) < 90).length, color: "#3b82f6" },
    { label: "60-74", count: graded.filter((t) => (t.rate ?? 0) >= 60 && (t.rate ?? 0) < 75).length, color: "#f59e0b" },
    { label: "45-59", count: graded.filter((t) => (t.rate ?? 0) >= 45 && (t.rate ?? 0) < 60).length, color: "#f97316" },
    { label: "0-44", count: graded.filter((t) => (t.rate ?? 0) < 45).length, color: "#ef4444" },
  ];
  const maxDist = Math.max(...dist.map((d) => d.count), 1);

  return (
    <SafeAreaContainer>
      <ViewTitle back>Statystyki Ocen</ViewTitle>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={C.primary} size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Overall summary */}
          <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
            <Text style={[styles.cardTitle, { color: C.text }]}>Podsumowanie ogólne</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={[styles.bigNum, { color: C.primary }]}>{tasks.length}</Text>
                <Text style={[styles.smallLabel, { color: C.textSub }]}>Wszystkich</Text>
              </View>
              <View style={[styles.vDivider, { backgroundColor: C.border }]} />
              <View style={styles.summaryItem}>
                <Text style={[styles.bigNum, { color: C.primary }]}>{graded.length}</Text>
                <Text style={[styles.smallLabel, { color: C.textSub }]}>Ocenionych</Text>
              </View>
              <View style={[styles.vDivider, { backgroundColor: C.border }]} />
              <View style={styles.summaryItem}>
                <Text style={[styles.bigNum, { color: totalAvg !== null ? (totalAvg >= 60 ? C.success : C.danger) : C.textSub }]}>
                  {totalAvg ?? "—"}
                </Text>
                <Text style={[styles.smallLabel, { color: C.textSub }]}>Średnia</Text>
              </View>
              <View style={[styles.vDivider, { backgroundColor: C.border }]} />
              <View style={styles.summaryItem}>
                <Text style={[styles.bigNum, { color: C.success }]}>
                  {graded.filter((t) => (t.rate ?? 0) >= 60).length}
                </Text>
                <Text style={[styles.smallLabel, { color: C.textSub }]}>Zaliczonych</Text>
              </View>
            </View>
          </View>

          {/* Grade distribution */}
          <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
            <Text style={[styles.cardTitle, { color: C.text }]}>Rozkład ocen</Text>
            {dist.map((d) => (
              <View key={d.label} style={styles.distRow}>
                <Text style={[styles.distLabel, { color: C.textSub }]}>{d.label}</Text>
                <View style={[styles.barTrack, { backgroundColor: C.inputBg }]}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${(d.count / maxDist) * 100}%`, backgroundColor: d.color },
                    ]}
                  />
                </View>
                <Text style={[styles.distCount, { color: d.color }]}>{d.count}</Text>
              </View>
            ))}
          </View>

          {/* Per-student stats */}
          <Text style={[styles.sectionHeader, { color: C.text }]}>Uczniowie</Text>
          {studentStats.map(({ student, tasks: st, avg, passed }) => (
            <View
              key={student.uid}
              style={[styles.studentCard, { backgroundColor: C.surface, borderColor: C.border }]}
            >
              <View style={styles.studentHeader}>
                <View style={[styles.avatar, { backgroundColor: C.primary + "20" }]}>
                  <Text style={[styles.avatarText, { color: C.primary }]}>
                    {student.firstName.charAt(0)}{student.surname.charAt(0)}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.studentName, { color: C.text }]}>
                    {student.firstName} {student.surname}
                  </Text>
                  <Text style={[styles.studentSub, { color: C.textSub }]}>
                    {st.length} zadań · {avg !== null ? `Średnia: ${avg}` : "Brak ocen"}
                  </Text>
                </View>
                {avg !== null && (
                  <View style={[styles.avgBadge, { backgroundColor: (avg >= 60 ? C.success : C.danger) + "20" }]}>
                    <Text style={[styles.avgText, { color: avg >= 60 ? C.success : C.danger }]}>
                      {avg}
                    </Text>
                  </View>
                )}
              </View>
              {st.length > 0 && (
                <View style={[styles.miniProgress, { backgroundColor: C.inputBg }]}>
                  <View
                    style={[
                      styles.miniBar,
                      {
                        width: `${(passed / Math.max(st.length, 1)) * 100}%`,
                        backgroundColor: C.success,
                      },
                    ]}
                  />
                </View>
              )}
              {st.length > 0 && (
                <Text style={[styles.passedLabel, { color: C.textSub }]}>
                  {passed}/{st.length} zaliczonych ({Math.round((passed / st.length) * 100)}%)
                </Text>
              )}
            </View>
          ))}
          {studentStats.length === 0 && (
            <View style={styles.center}>
              <Text style={{ fontSize: 36 }}>📊</Text>
              <Text style={[{ color: C.textSub, marginTop: 12 }]}>Brak danych</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 40 },
  scroll: { padding: 16, gap: 12, paddingBottom: 32 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: "700", marginBottom: 14 },
  summaryRow: { flexDirection: "row", alignItems: "center" },
  summaryItem: { flex: 1, alignItems: "center" },
  bigNum: { fontSize: 28, fontWeight: "800" },
  smallLabel: { fontSize: 11, marginTop: 2 },
  vDivider: { width: 1, height: 36 },
  distRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  distLabel: { width: 44, fontSize: 12, fontWeight: "600" },
  barTrack: { flex: 1, height: 14, borderRadius: 7, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 7 },
  distCount: { width: 24, fontSize: 13, fontWeight: "700", textAlign: "right" },
  sectionHeader: { fontSize: 16, fontWeight: "700", marginTop: 4 },
  studentCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  studentHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  avatarText: { fontSize: 15, fontWeight: "700" },
  studentName: { fontSize: 15, fontWeight: "700" },
  studentSub: { fontSize: 12, marginTop: 2 },
  avgBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  avgText: { fontSize: 18, fontWeight: "800" },
  miniProgress: { height: 8, borderRadius: 4, overflow: "hidden", marginBottom: 6 },
  miniBar: { height: "100%", borderRadius: 4 },
  passedLabel: { fontSize: 12 },
});
