import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import { StyleSheet, FlatList, View, Text, TouchableOpacity } from "react-native";
import SafeAreaContainer from "@/src/components/SafeAreaContainer";
import ViewTitle from "@/src/components/ViewTitle";
import Loader from "@/src/components/Loader";
import { localAuth } from "@/src/services/localAuth";
import { getUserDataByUid } from "@/src/services/userApi";
import {
  getAttendanceForStudent,
  calcSummary,
  type AttendanceRecord,
  type AttendanceSummary,
} from "@/src/services/attendanceApi";

type Child = { uid: string; name: string };

export default function ParentPresence() {
  const me = localAuth.currentUser;
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const ids = me?.childIds ?? [];
      const resolved: Child[] = [];
      for (const id of ids) {
        const u = await getUserDataByUid(id);
        if (u) resolved.push({ uid: id, name: `${u.firstName} ${u.surname}` });
      }
      setChildren(resolved);
      setSelectedChild(resolved[0]?.uid ?? null);
    })();
  }, []);

  const fetchAttendance = useCallback(async () => {
    if (!selectedChild) {
      setRecords([]);
      setSummary(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getAttendanceForStudent(selectedChild);
      setRecords(data);
      setSummary(calcSummary(data));
    } finally {
      setLoading(false);
    }
  }, [selectedChild]);

  useFocusEffect(
    useCallback(() => {
      fetchAttendance();
    }, [fetchAttendance])
  );

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-");
    return `${day}.${month}.${year}`;
  };

  const getPercentageColor = (pct: number) => {
    if (pct >= 80) return "#4CAF50";
    if (pct >= 60) return "#FFA726";
    return "#EF5350";
  };

  return (
    <SafeAreaContainer>
      <ViewTitle back>Frekwencja dziecka</ViewTitle>

      {children.length > 1 && (
        <View style={styles.chipsRow}>
          {children.map((c) => (
            <TouchableOpacity
              key={c.uid}
              style={[styles.chip, selectedChild === c.uid && styles.chipActive]}
              onPress={() => setSelectedChild(c.uid)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedChild === c.uid && styles.chipTextActive,
                ]}
              >
                {c.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {loading ? (
        <Loader />
      ) : children.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>
            Brak przypisanych dzieci do tego konta.
          </Text>
        </View>
      ) : (
        <>
          {summary && (
            <View style={styles.summaryCard}>
              <View style={styles.percentageRow}>
                <Text style={styles.summaryLabel}>Frekwencja</Text>
                <Text
                  style={[
                    styles.percentage,
                    { color: getPercentageColor(summary.percentage) },
                  ]}
                >
                  {summary.percentage}%
                </Text>
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{summary.present}</Text>
                  <Text style={styles.statLabel}>Obecny</Text>
                </View>
                <View style={[styles.statItem, styles.statBorder]}>
                  <Text style={[styles.statNumber, { color: "#EF5350" }]}>
                    {summary.absent}
                  </Text>
                  <Text style={styles.statLabel}>Nieobecny</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{summary.total}</Text>
                  <Text style={styles.statLabel}>Łącznie</Text>
                </View>
              </View>
            </View>
          )}

          <FlatList
            data={records}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.center}>
                <Text style={styles.emptyText}>Brak zapisów obecności.</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.row}>
                <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: item.present ? "#E8F5E9" : "#FFEBEE" },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      { color: item.present ? "#2E7D32" : "#C62828" },
                    ]}
                  >
                    {item.present ? "Obecny" : "Nieobecny"}
                  </Text>
                </View>
              </View>
            )}
          />
        </>
      )}
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 15,
    marginBottom: 12,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#EEEEEE",
  },
  chipActive: { backgroundColor: "#5C6BC0" },
  chipText: { color: "#616161", fontSize: 13, fontWeight: "600" },
  chipTextActive: { color: "#FFF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  emptyText: { color: "#9E9E9E", fontSize: 16, textAlign: "center", marginTop: 40 },
  summaryCard: {
    margin: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E8EAF6",
  },
  percentageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  summaryLabel: { fontSize: 18, fontWeight: "700", color: "#1A237E" },
  percentage: { fontSize: 36, fontWeight: "800" },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E8EAF6",
  },
  statItem: { flex: 1, alignItems: "center" },
  statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: "#E8EAF6" },
  statNumber: { fontSize: 24, fontWeight: "700", color: "#3C4858" },
  statLabel: { fontSize: 12, color: "#757575", marginTop: 4 },
  list: { paddingHorizontal: 16, paddingBottom: 20, gap: 8 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#E8EAF6",
  },
  dateText: { fontSize: 15, fontWeight: "500", color: "#3C4858" },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeText: { fontSize: 13, fontWeight: "600" },
});
