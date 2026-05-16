import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import SafeAreaContainer from "@/src/components/SafeAreaContainer";
import ViewTitle from "@/src/components/ViewTitle";
import { localAuth } from "@/src/services/localAuth";
import { localDb, type StoredTask } from "@/src/services/localDb";
import { getUpcomingEvents, type SchoolEvent } from "@/src/services/eventsApi";
import { useAppTheme } from "@/src/context/ThemeContext";

type Item =
  | { kind: "task"; task: StoredTask }
  | { kind: "event"; event: SchoolEvent };

const EVENT_ICONS: Record<string, string> = {
  exam: "📝",
  holiday: "🏖️",
  meeting: "👥",
  other: "📌",
};

function daysUntil(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export default function NotificationsScreen() {
  const { C } = useAppTheme();
  const router = useRouter();
  const me = localAuth.currentUser!;
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [tasks, events] = await Promise.all([
      localDb.tasks.getByUserId(me.uid),
      getUpcomingEvents(),
    ]);
    const pending: Item[] = tasks
      .filter((t) => !t.answerContent)
      .map((t) => ({ kind: "task" as const, task: t }));
    const evItems: Item[] = events.map((e) => ({ kind: "event" as const, event: e }));
    setItems([...pending, ...evItems]);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const renderTask = (task: StoredTask) => {
    const d = daysUntil(task.date);
    const urgency = d < 0 ? "#ef4444" : d <= 3 ? "#f59e0b" : C.primary;
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: C.surface, borderColor: urgency + "40", borderLeftColor: urgency }]}
        onPress={() => router.push(`/student/homework/${task.id}`)}
      >
        <Text style={styles.cardIcon}>📚</Text>
        <View style={styles.cardBody}>
          <Text style={[styles.cardTitle, { color: C.text }]}>{task.title}</Text>
          <Text style={[styles.cardSub, { color: C.textSub }]}>Zadanie bez odpowiedzi</Text>
        </View>
        <View style={[styles.urgencyBadge, { backgroundColor: urgency + "20" }]}>
          <Text style={[styles.urgencyText, { color: urgency }]}>
            {d < 0 ? "Zaległe" : d === 0 ? "Dziś" : `${d}d`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEvent = (event: SchoolEvent) => {
    const d = daysUntil(event.date);
    const color = event.type === "exam" ? "#ef4444" : event.type === "meeting" ? C.primary : C.success;
    return (
      <View style={[styles.card, { backgroundColor: C.surface, borderColor: color + "40", borderLeftColor: color }]}>
        <Text style={styles.cardIcon}>{EVENT_ICONS[event.type]}</Text>
        <View style={styles.cardBody}>
          <Text style={[styles.cardTitle, { color: C.text }]}>{event.title}</Text>
          <Text style={[styles.cardSub, { color: C.textSub }]} numberOfLines={1}>{event.description}</Text>
        </View>
        <View style={[styles.urgencyBadge, { backgroundColor: color + "20" }]}>
          <Text style={[styles.urgencyText, { color }]}>
            {d === 0 ? "Dziś" : `${d}d`}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaContainer>
      <ViewTitle back>Powiadomienia</ViewTitle>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={C.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item, i) =>
            item.kind === "task" ? item.task.id : item.event.id + i
          }
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ fontSize: 40 }}>✅</Text>
              <Text style={[styles.empty, { color: C.textSub }]}>
                Wszystko zrobione! Brak powiadomień.
              </Text>
            </View>
          }
          renderItem={({ item }) =>
            item.kind === "task"
              ? renderTask(item.task)
              : renderEvent(item.event)
          }
        />
      )}
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 40 },
  empty: { fontSize: 15, marginTop: 12 },
  list: { padding: 16, gap: 10 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  cardIcon: { fontSize: 24 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  cardSub: { fontSize: 13 },
  urgencyBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  urgencyText: { fontSize: 12, fontWeight: "700" },
});
