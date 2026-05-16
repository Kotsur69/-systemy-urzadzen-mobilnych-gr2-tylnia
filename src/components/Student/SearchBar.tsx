import { StyleSheet, TextInput } from "react-native";

export default function SearchBar({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}) {
  return (
    <TextInput
      style={styles.searchInput}
      placeholder="Szukaj..."
      placeholderTextColor="#666"
      value={searchQuery}
      onChangeText={setSearchQuery}
    />
  );
}

const styles = StyleSheet.create({
  searchInput: {
    height: 32,
    borderWidth: 1,
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 12,
    backgroundColor: "#f0f0f0",
    borderColor: "#e0e0e0",
    color: "#666",
  },
});
