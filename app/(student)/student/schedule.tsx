import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useFocusEffect } from "expo-router";
import SafeAreaContainer from "@/src/components/SafeAreaContainer";
import ViewTitle from "@/src/components/ViewTitle";
import { DAY_NAMES, getFullSchedule, type ScheduleEntry } from "@/src/services/scheduleApi";
import { getAllSubjects, type Subject } from "@/src/services/subjectsApi";
import { useAppTheme } from "@/src/context/ThemeContext";

export default function ScheduleScreen() {
  const { C } = useAppTheme();
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [subjects, setSubjects] = useState<Record<string, Subject>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [sched, subs] = await Promise.all([getFullSchedule(), getAllSubjects()]);
    const subMap: Record<string, Subject> = {};
    subs.forEach((s) => { subMap[s.id] = s; });
    setEntries(sched);
    setSubjects(subMap);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const today = new Date().getDay(); // 0=Sun,1=Mon...
  const todayIndex = today === 0 || today === 6 ? -1 : today - 1; // map to Mon=0

  const byDay: Record<number, ScheduleEntry[]> = {};
  entries.forEach((e) => {
    if (!byDay[e.dayOfWeek]) byDay[e.dayOfWeek] = [];
    byDay[e.dayOfWeek].push(e);
    byDay[e.dayOfWeek].sort((a, b) => a.startTime.localeCompare(b.startTime));
  });

  return (
    <SafeAreaContainer>
      <ViewTitle back>Plan Lekcji</ViewTitle>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={C.primary} size="large" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {DAY_NAMES.map((dayName, dayIdx) => {
            const dayEntries = byDay[dayIdx] ?? [];
            const isToday = dayIdx === todayIndex;
            return (
              <View key={dayIdx} style={styles.dayBlock}>
                <View style={[styles.dayHeader, isToday && { backgroundColor: C.primary + "20" }]}>
                  <Text style={[styles.dayName, { color: isToday ? C.primary : C.text }]}>
                    {dayName}
                  </Text>
                  {isToday && (
                    <View style={[styles.todayBadge, { backgroundColor: C.primary }]}>
                      <Text style={styles.todayText}>Dziś</Text>
                    </View>
                  )}
                </View>
                {dayEntries.length === 0 ? (
                  <Text style={[styles.free, { color: C.textSub }]}>Brak zajęć</Text>
                ) : (
                  dayEntries.map((entry) => {
                    const sub = subjects[entry.subjectId];
                    return (
                      <View
                        key={entry.id}
                        style={[styles.lesson, { backgroundColor: C.surface, borderColor: C.border }]}
                      >
                        <View style={[styles.colorDot, { backgroundColor: sub?.color ?? C.primary }]} />
                        <View style={styles.lessonInfo}>
                          <Text style={[styles.lessonName, { color: C.text }]}>
                            {sub?.name ?? "Nieznany przedmiot"}
                          </Text>
                          <Text style={[styles.lessonTime, { color: C.textSub }]}>
                            {entry.startTime} – {entry.endTime}
                          </Text>
                        </View>
                        <View style={[styles.roomBadge, { backgroundColor: C.inputBg, borderColor: C.border }]}>
                          <Text style={[styles.roomText, { color: C.textSub }]}>Sala {entry.room}</Text>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scroll: { padding: 16, paddingBottom: 32 },
  dayBlock: { marginBottom: 20 },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 8,
    gap: 8,
  },
  dayName: { fontSize: 16, fontWeight: "700" },
  todayBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  todayText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  free: { paddingHorizontal: 12, fontSize: 14, fontStyle: "italic" },
  lesson: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  colorDot: { width: 12, height: 12, borderRadius: 6 },
  lessonInfo: { flex: 1 },
  lessonName: { fontSize: 15, fontWeight: "600", marginBottom: 2 },
  lessonTime: { fontSize: 13 },
  roomBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  roomText: { fontSize: 12, fontWeight: "600" },
});
