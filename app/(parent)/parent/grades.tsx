import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import { StyleSheet, FlatList, View, Text, TouchableOpacity } from "react-native";
import SafeAreaContainer from "@/src/components/SafeAreaContainer";
import ViewTitle from "@/src/components/ViewTitle";
import Loader from "@/src/components/Loader";
import SingleGrade from "@/src/components/Student/SingleGrade";
import { localAuth } from "@/src/services/localAuth";
import { getUserDataByUid } from "@/src/services/userApi";
import { getRatingSubjects, type RatingSubject } from "@/src/services/studentApi";

type Child = { uid: string; name: string };

export default function ParentGrades() {
  const me = localAuth.currentUser;
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [data, setData] = useState<RatingSubject[]>([]);
  const [loading, setLoading] = useState(true);

  // Wczytaj listę dzieci rodzica (raz).
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

  const fetchGrades = useCallback(async () => {
    if (!selectedChild) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const subjects = await getRatingSubjects(selectedChild);
      setData(subjects);
    } finally {
      setLoading(false);
    }
  }, [selectedChild]);

  useFocusEffect(
    useCallback(() => {
      fetchGrades();
    }, [fetchGrades])
  );

  return (
    <SafeAreaContainer>
      <ViewTitle back>Oceny dziecka</ViewTitle>

      {children.length > 1 && (
        <View style={styles.chipsRow}>
          {children.map((c) => (
            <TouchableOpacity
              key={c.uid}
              style={[
                styles.chip,
                selectedChild === c.uid && styles.chipActive,
              ]}
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
        <FlatList
          data={data}
          renderItem={({ item }) => <SingleGrade {...item} />}
          keyExtractor={(item) => item.uid}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Brak ocen.</Text>
          }
        />
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
  listContent: { padding: 15, gap: 10 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#757575",
    fontSize: 16,
  },
});
