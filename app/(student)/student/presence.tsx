import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import {
  StyleSheet,
  FlatList,
  View,
  Text,
} from "react-native";
import SafeAreaContainer from "@/src/components/SafeAreaContainer";
import ViewTitle from "@/src/components/ViewTitle";
import Loader from "@/src/components/Loader";
import { localAuth } from "@/src/services/localAuth";
import {
  getAttendanceForStudent,
  calcSummary,
  type AttendanceRecord,
  type AttendanceSummary,
} from "@/src/services/attendanceApi";

export default function PresencePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchAttendance();
    }, [])
  );

  async function fetchAttendance() {
    setLoading(true);
    setError(null);
    try {
      const uid = localAuth.currentUser?.uid;
      if (!uid) throw new Error("Brak zalogowanego użytkownika.");
      const data = await getAttendanceForStudent(uid);
      setRecords(data);
      setSummary(calcSummary(data));
    } catch {
      setError("Nie udało się załadować danych obecności.");
    } finally {
      setLoading(false);
    }
  }

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
      <ViewTitle back>Obecność</ViewTitle>

      {loading ? (
        <Loader />
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
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
                    {
                      backgroundColor: item.present ? "#E8F5E9" : "#FFEBEE",
                    },
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#EF5350",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  emptyText: {
    color: "#9E9E9E",
    fontSize: 16,
    textAlign: "center",
    marginTop: 40,
  },
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
  summaryLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A237E",
  },
  percentage: {
    fontSize: 36,
    fontWeight: "800",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E8EAF6",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#E8EAF6",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3C4858",
  },
  statLabel: {
    fontSize: 12,
    color: "#757575",
    marginTop: 4,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 8,
  },
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
  dateText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#3C4858",
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
