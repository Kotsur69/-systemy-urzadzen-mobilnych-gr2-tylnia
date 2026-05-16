import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { useFocusEffect } from "expo-router";
import SafeAreaContainer from "@/src/components/SafeAreaContainer";
import ViewTitle from "@/src/components/ViewTitle";
import { getAllEvents, type SchoolEvent } from "@/src/services/eventsApi";
import { useAppTheme } from "@/src/context/ThemeContext";

const TYPE_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  exam: { icon: "📝", color: "#ef4444", label: "Sprawdzian" },
  holiday: { icon: "🏖️", color: "#10b981", label: "Dzień wolny" },
  meeting: { icon: "👥", color: "#3b82f6", label: "Zebranie" },
  other: { icon: "📌", color: "#8b5cf6", label: "Wydarzenie" },
};

function formatDate(str: string) {
  return new Date(str).toLocaleDateString("pl-PL", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
}

function isPast(str: string) {
  return new Date(str) < new Date(new Date().toDateString());
}

export default function EventsScreen() {
  const { C } = useAppTheme();
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const all = await getAllEvents();
    all.sort((a, b) => a.date.localeCompare(b.date));
    setEvents(all);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const upcoming = events.filter((e) => !isPast(e.date));
  const past = events.filter((e) => isPast(e.date));

  const renderEvent = (item: SchoolEvent) => {
    const cfg = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.other;
    const past = isPast(item.date);
    return (
      <View
        key={item.id}
        style={[
          styles.card,
          { backgroundColor: C.surface, borderColor: C.border, opacity: past ? 0.6 : 1 },
        ]}
      >
        <View style={[styles.leftBar, { backgroundColor: cfg.color }]} />
        <View style={[styles.iconBox, { backgroundColor: cfg.color + "20" }]}>
          <Text style={styles.icon}>{cfg.icon}</Text>
        </View>
        <View style={styles.body}>
          <View style={styles.topRow}>
            <Text style={[styles.title, { color: C.text }]}>{item.title}</Text>
            <View style={[styles.typeBadge, { backgroundColor: cfg.color + "20" }]}>
              <Text style={[styles.typeText, { color: cfg.color }]}>{cfg.label}</Text>
            </View>
          </View>
          <Text style={[styles.date, { color: C.primary }]}>{formatDate(item.date)}</Text>
          <Text style={[styles.desc, { color: C.textSub }]} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaContainer>
      <ViewTitle back>Terminarz</ViewTitle>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={C.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(e) => e.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => renderEvent(item)}
          ListHeaderComponent={
            upcoming.length > 0 ? null : (
              <Text style={[styles.sectionLabel, { color: C.textSub }]}>Brak nadchodzących wydarzeń</Text>
            )
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ fontSize: 40 }}>📅</Text>
              <Text style={[{ color: C.textSub, marginTop: 12 }]}>Brak wydarzeń</Text>
            </View>
          }
        />
      )}
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 40 },
  list: { padding: 16, gap: 12 },
  sectionLabel: { fontSize: 13, marginBottom: 8, textAlign: "center" },
  card: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  leftBar: { width: 5 },
  iconBox: { width: 56, justifyContent: "center", alignItems: "center" },
  icon: { fontSize: 24 },
  body: { flex: 1, padding: 14 },
  topRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 4 },
  title: { flex: 1, fontSize: 15, fontWeight: "700" },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  typeText: { fontSize: 11, fontWeight: "700" },
  date: { fontSize: 13, fontWeight: "600", marginBottom: 4, textTransform: "capitalize" },
  desc: { fontSize: 13, lineHeight: 18 },
});
