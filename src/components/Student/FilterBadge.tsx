import { StyleSheet, Text, TouchableOpacity } from "react-native";

type FilterBadgeProps = {
  title: string;
  currentFilter: string | null;
  filter: string;
  setFilter: (filter: string) => void;
};

export default function FilterBadge({
  title,
  currentFilter,
  filter,
  setFilter,
}: FilterBadgeProps) {
  return (
    <TouchableOpacity
      style={[
        styles.filterButton,
        currentFilter === filter && styles.filterButtonActive,
      ]}
      onPress={() => setFilter(filter)}
    >
      <Text
        style={[
          styles.filterText,
          currentFilter === filter && styles.filterTextActive,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  filterButtonActive: {
    backgroundColor: "#e3f2fd",
    borderColor: "#2196F3",
  },
  filterText: {
    color: "#666",
    fontWeight: "500",
    fontSize: 13,
  },
  filterTextActive: {
    color: "#2196F3",
  },
});
