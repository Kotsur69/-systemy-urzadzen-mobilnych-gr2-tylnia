import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useFocusEffect } from "expo-router";
import SafeAreaContainer from "@/src/components/SafeAreaContainer";
import ViewTitle from "@/src/components/ViewTitle";
import { getAllSubjects, type Subject } from "@/src/services/subjectsApi";
import { localDb } from "@/src/services/localDb";
import { useAppTheme } from "@/src/context/ThemeContext";

export default function StudentSubjects() {
  const { C } = useAppTheme();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teacherNames, setTeacherNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [subs, users] = await Promise.all([
      getAllSubjects(),
      localDb.users.getAll(),
    ]);
    const names: Record<string, string> = {};
    users
      .filter((u) => u.role === "teacher")
      .forEach((u) => {
        names[u.uid] = `${u.firstName} ${u.surname}`;
      });
    setSubjects(subs);
    setTeacherNames(names);
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  return (
    <SafeAreaContainer>
      <ViewTitle>Przedmioty</ViewTitle>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : (
        <FlatList
          data={subjects}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={[styles.empty, { color: C.textSub }]}>
                Brak przedmiotów
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
              <View style={[styles.colorBar, { backgroundColor: item.color }]} />
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <View style={[styles.badge, { backgroundColor: item.color + "20" }]}>
                    <Text style={[styles.badgeText, { color: item.color }]}>
                      {item.name.slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={[styles.name, { color: C.text }]}>{item.name}</Text>
                </View>
                <Text style={[styles.desc, { color: C.textSub }]}>
                  {item.description}
                </Text>
                <Text style={[styles.teacher, { color: C.textSub }]}>
                  Nauczyciel: {teacherNames[item.teacherId] ?? "(nieznany)"}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { fontSize: 16 },
  list: { padding: 16, gap: 14 },
  card: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  colorBar: { width: 6 },
  cardContent: { flex: 1, padding: 16 },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 10 },
  badge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: { fontSize: 14, fontWeight: "800" },
  name: { fontSize: 17, fontWeight: "700", flex: 1 },
  desc: { fontSize: 13, lineHeight: 20, marginBottom: 8 },
  teacher: { fontSize: 12 },
});
