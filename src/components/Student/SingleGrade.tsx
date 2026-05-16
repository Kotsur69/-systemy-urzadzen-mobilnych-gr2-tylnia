import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
} from "react-native";
import type { RatingSubject } from "@/src/services/studentApi";

function getRatingColor(rate: number) {
  if (rate >= 90) return "#4CAF50";
  if (rate >= 70) return "#2196F3";
  if (rate >= 50) return "#FF9800";
  return "#F44336";
}

export default function SingleGrade({
  title,
  rate,
  comment,
  teacherName,
  commited,
  taskContent,
}: RatingSubject) {
  const ratingColor = getRatingColor(rate);
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 4,
        }}
      >
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: commited ? "#E8F5E9" : "#FFEBEE",
                alignSelf: "flex-start",
                marginTop: 8,
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: commited ? "#2E7D32" : "#C62828" },
              ]}
            >
              {commited ? "Ocenione" : "Oczekujące"}
            </Text>
          </View>
        </View>

        <View style={[styles.ratingPill, { backgroundColor: ratingColor }]}>
          <Text style={styles.ratingValue}>{rate}</Text>
          <Text style={styles.ratingMax}>/100</Text>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.7}
        style={{ marginTop: 8, paddingVertical: 4 }}
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setExpanded(!expanded);
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ fontSize: 12, fontWeight: "600", color: "#757575" }}>
            Szczegóły oceny
          </Text>
          <Text
            style={{
              fontSize: 10,
              marginLeft: 6,
              color: "#757575",
              transform: [{ rotate: expanded ? "180deg" : "0deg" }],
            }}
          >
            ▼
          </Text>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View
          style={{
            marginTop: 8,
            borderTopWidth: 1,
            borderTopColor: "#f0f0f0",
            paddingTop: 12,
          }}
        >
          {taskContent ? (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Zadanie</Text>
              <Text style={styles.contentParams}>{taskContent}</Text>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Nauczyciel</Text>
            <Text style={styles.teacherName}>
              {teacherName || "Nieznany nauczyciel"}
            </Text>
          </View>

          {comment ? (
            <View style={[styles.feedbackBox, { marginTop: 6 }]}>
              <Text style={styles.sectionLabel}>Opinia</Text>
              <Text style={styles.commentText}>{comment}</Text>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: "#fff",
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  section: {
    marginBottom: 8,
    backgroundColor: "transparent",
  },
  sectionLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    marginBottom: 3,
    opacity: 0.7,
    fontWeight: "700",
  },
  contentParams: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.9,
  },
  teacherName: {
    fontSize: 13,
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "baseline",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  ratingValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  ratingMax: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 10,
    marginLeft: 2,
    fontWeight: "600",
  },
  feedbackBox: {
    backgroundColor: "#F5F5F5",
    marginTop: 10,
    padding: 8,
    borderRadius: 8,
  },
  commentText: {
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 2,
  },
});
