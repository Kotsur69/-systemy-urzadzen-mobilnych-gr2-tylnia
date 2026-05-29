import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "expo-router";
import SafeAreaContainer from "@/src/components/SafeAreaContainer";
import ViewTitle from "@/src/components/ViewTitle";
import { localAuth } from "@/src/services/localAuth";
import {
  getStudentsAttendanceForDate,
  saveAttendanceBatch,
  type StudentAttendanceForDate,
} from "@/src/services/attendanceApi";

const DAY_NAMES = [
  "Niedziela",
  "Poniedziałek",
  "Wtorek",
  "Środa",
  "Czwartek",
  "Piątek",
  "Sobota",
];

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function shiftDate(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatPL(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  const [y, m, day] = iso.split("-");
  return `${DAY_NAMES[d.getDay()]}, ${day}.${m}.${y}`;
}

export default function TeacherAttendance() {
  const [date, setDate] = useState(todayISO());
  const [rows, setRows] = useState<StudentAttendanceForDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (forDate: string) => {
    setLoading(true);
    try {
      const data = await getStudentsAttendanceForDate(forDate);
      setRows(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(date);
    }, [date, load])
  );

  const changeDate = (days: number) => {
    setDate((prev) => shiftDate(prev, days));
  };

  const setPresent = (uid: string, present: boolean) => {
    setRows((prev) =>
      prev.map((r) => (r.uid === uid ? { ...r, present } : r))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveAttendanceBatch(
        date,
        localAuth.currentUser?.uid ?? "",
        rows.map((r) => ({ studentId: r.uid, present: r.present }))
      );
      Alert.alert("Zapisano", "Frekwencja została zapisana.");
      load(date);
    } catch (e) {
      console.error(e);
      Alert.alert("Błąd", "Nie udało się zapisać frekwencji.");
    } finally {
      setSaving(false);
    }
  };

  const presentCount = rows.filter((r) => r.present).length;

  return (
    <SafeAreaContainer>
      <ViewTitle back>Frekwencja</ViewTitle>

      {/* Wybór dnia */}
      <View style={styles.dateBar}>
        <TouchableOpacity style={styles.dateNav} onPress={() => changeDate(-1)}>
          <Text style={styles.dateNavText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.dateCenter}>
          <Text style={styles.dateText}>{formatPL(date)}</Text>
          {date !== todayISO() && (
            <TouchableOpacity onPress={() => setDate(todayISO())}>
              <Text style={styles.todayLink}>Wróć do dziś</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.dateNav} onPress={() => changeDate(1)}>
          <Text style={styles.dateNavText}>›</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <>
          <Text style={styles.summary}>
            Obecnych: {presentCount} / {rows.length}
          </Text>
          <FlatList
            data={rows}
            keyExtractor={(item) => item.uid}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={styles.empty}>Brak uczniów.</Text>
            }
            renderItem={({ item }) => (
              <View style={styles.row}>
                <View style={styles.rowInfo}>
                  <Text style={styles.studentName}>
                    {item.firstName} {item.surname}
                  </Text>
                  {!item.recorded && (
                    <Text style={styles.notRecorded}>Brak wpisu</Text>
                  )}
                </View>
                <View style={styles.toggleGroup}>
                  <TouchableOpacity
                    style={[
                      styles.toggleBtn,
                      item.present && styles.togglePresentActive,
                    ]}
                    onPress={() => setPresent(item.uid, true)}
                  >
                    <Text
                      style={[
                        styles.toggleText,
                        item.present && styles.toggleTextActive,
                      ]}
                    >
                      Obecny
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.toggleBtn,
                      !item.present && styles.toggleAbsentActive,
                    ]}
                    onPress={() => setPresent(item.uid, false)}
                  >
                    <Text
                      style={[
                        styles.toggleText,
                        !item.present && styles.toggleTextActive,
                      ]}
                    >
                      Nieobecny
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? "Zapisywanie..." : "Zapisz frekwencję"}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  dateBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginBottom: 12,
  },
  dateNav: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  dateNavText: { fontSize: 26, color: "#3b82f6", fontWeight: "700" },
  dateCenter: { flex: 1, alignItems: "center" },
  dateText: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
  todayLink: { fontSize: 13, color: "#3b82f6", marginTop: 2 },
  summary: {
    textAlign: "center",
    fontSize: 14,
    color: "#64748b",
    marginBottom: 8,
    fontWeight: "600",
  },
  list: { paddingHorizontal: 16, paddingBottom: 12, gap: 10 },
  empty: { textAlign: "center", color: "#94a3b8", marginTop: 40, fontSize: 16 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  rowInfo: { flex: 1, marginRight: 12 },
  studentName: { fontSize: 15, fontWeight: "600", color: "#0f172a" },
  notRecorded: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  toggleGroup: { flexDirection: "row", gap: 8 },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#f8fafc",
  },
  togglePresentActive: { backgroundColor: "#10b981", borderColor: "#10b981" },
  toggleAbsentActive: { backgroundColor: "#ef4444", borderColor: "#ef4444" },
  toggleText: { fontSize: 13, fontWeight: "600", color: "#64748b" },
  toggleTextActive: { color: "#ffffff" },
  saveButton: {
    backgroundColor: "#3b82f6",
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
});
