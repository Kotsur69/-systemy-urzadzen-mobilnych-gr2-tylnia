import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { getRatingSubjects, RatingSubject } from "@/src/services/studentApi";
import { getCurrentUserData } from "@/src/services/userApi";
import { StyleSheet, FlatList, View, Text } from "react-native";
import SafeAreaContainer from "@/src/components/SafeAreaContainer";
import SingleGrade from "@/src/components/Student/SingleGrade";
import ViewTitle from "@/src/components/ViewTitle";
import FilterBadge from "@/src/components/Student/FilterBadge";
import FilterContainer from "@/src/components/Student/FilterContainer";
import Loader from "@/src/components/Loader";
import SearchBar from "@/src/components/Student/SearchBar";

export default function GradesPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RatingSubject[]>();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string | null>(null);

  async function fetchRatings() {
    setLoading(true);

    try {
      const user = await getCurrentUserData();
      const subjects = await getRatingSubjects(user.uid);
      setData(subjects);
    } catch (err) {
      setError("Błąd podczas ładowania ocen.");
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchRatings();
    }, [])
  );

  const filteredData = data?.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === "ocenione") return item.commited;
    if (filter === "oczekujace") return !item.commited;
    return true;
  });

  const toggleFilter = (newFilter: "ocenione" | "oczekujace") => {
    if (filter === newFilter) {
      setFilter(null);
    } else {
      setFilter(newFilter);
    }
  };

  return (
    <SafeAreaContainer>
      <ViewTitle back>Oceny</ViewTitle>
      <FilterContainer>
        <FilterBadge
          title="Ocenione"
          currentFilter={filter}
          filter="ocenione"
          setFilter={() => toggleFilter("ocenione")}
        />
        <FilterBadge
          title="Oczekujące"
          currentFilter={filter}
          filter="oczekujace"
          setFilter={() => toggleFilter("oczekujace")}
        />
      </FilterContainer>
      <SearchBar searchQuery={search} setSearchQuery={setSearch} />
      {loading ? (
        <Loader />
      ) : error ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "red",
              fontSize: 16,
              fontWeight: "600",
              textTransform: "uppercase",
            }}
          >
            {error}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          renderItem={({ item }) => <SingleGrade {...item} />}
          keyExtractor={(item) => item.uid}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>Brak ocen</Text>}
        />
      )}
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  listContent: { padding: 15, gap: 10 },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#565656ff",
    fontSize: 24,
    fontWeight: "500",
  },
});
