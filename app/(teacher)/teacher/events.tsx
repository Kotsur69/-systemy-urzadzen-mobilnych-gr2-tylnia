import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  TouchableOpacity, Modal, TextInput, ScrollView, Alert,
} from "react-native";
import { useFocusEffect } from "expo-router";
import SafeAreaContainer from "@/src/components/SafeAreaContainer";
import ViewTitle from "@/src/components/ViewTitle";
import { getAllEvents, addEvent, deleteEvent, type SchoolEvent } from "@/src/services/eventsApi";
import { useAppTheme } from "@/src/context/ThemeContext";

const TYPE_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  exam:    { icon: "📝", color: "#ef4444", label: "Sprawdzian/Egzamin" },
  holiday: { icon: "🏖️", color: "#10b981", label: "Dzień wolny" },
  meeting: { icon: "👥", color: "#3b82f6", label: "Zebranie" },
  other:   { icon: "📌", color: "#8b5cf6", label: "Inne" },
};

const TYPES = ["exam", "holiday", "meeting", "other"] as const;

function formatDate(str: string) {
  return new Date(str).toLocaleDateString("pl-PL", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });
}

export default function TeacherEventsScreen() {
  const { C } = useAppTheme();
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState<SchoolEvent["type"]>("exam");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const all = await getAllEvents();
    all.sort((a, b) => a.date.localeCompare(b.date));
    setEvents(all);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const openModal = () => {
    setTitle("");
    setDescription("");
    setDate("");
    setType("exam");
    setFormError("");
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!title.trim()) { setFormError("Podaj tytuł."); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setFormError("Data w formacie RRRR-MM-DD (np. 2025-06-15).");
      return;
    }
    setSaving(true);
    await addEvent({ title: title.trim(), description: description.trim(), date, type });
    setSaving(false);
    setModalVisible(false);
    load();
  };

  const handleDelete = (event: SchoolEvent) => {
    Alert.alert(
      "Usuń wydarzenie",
      `Czy na pewno chcesz usunąć "${event.title}"?`,
      [
        { text: "Anuluj", style: "cancel" },
        {
          text: "Usuń", style: "destructive",
          onPress: async () => { await deleteEvent(event.id); load(); },
        },
      ]
    );
  };

  return (
    <SafeAreaContainer>
      <ViewTitle back>Terminarz</ViewTitle>

      <TouchableOpacity
        style={[styles.addBtn, { backgroundColor: C.primary }]}
        onPress={openModal}
      >
        <Text style={styles.addBtnText}>+ Dodaj wydarzenie</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={C.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(e) => e.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ fontSize: 40 }}>📅</Text>
              <Text style={[{ color: C.textSub, marginTop: 12 }]}>Brak wydarzeń</Text>
            </View>
          }
          renderItem={({ item }) => {
            const cfg = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.other;
            return (
              <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
                <View style={[styles.leftBar, { backgroundColor: cfg.color }]} />
                <View style={[styles.iconBox, { backgroundColor: cfg.color + "20" }]}>
                  <Text style={styles.icon}>{cfg.icon}</Text>
                </View>
                <View style={styles.body}>
                  <Text style={[styles.cardTitle, { color: C.text }]}>{item.title}</Text>
                  <Text style={[styles.cardDate, { color: C.primary }]} numberOfLines={1}>
                    {formatDate(item.date)}
                  </Text>
                  {item.description ? (
                    <Text style={[styles.cardDesc, { color: C.textSub }]} numberOfLines={2}>
                      {item.description}
                    </Text>
                  ) : null}
                  <View style={[styles.typeBadge, { backgroundColor: cfg.color + "20" }]}>
                    <Text style={[styles.typeText, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
                  <Text style={{ fontSize: 18 }}>🗑️</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}

      {/* Add event modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: C.surface }]}>
            <Text style={[styles.modalTitle, { color: C.text }]}>Nowe wydarzenie</Text>
            <ScrollView showsVerticalScrollIndicator={false}>

              <Text style={[styles.label, { color: C.textSub }]}>Tytuł *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: C.inputBg, color: C.text, borderColor: C.border }]}
                value={title}
                onChangeText={setTitle}
                placeholder="np. Sprawdzian z matematyki"
                placeholderTextColor={C.textSub}
              />

              <Text style={[styles.label, { color: C.textSub }]}>Data * (RRRR-MM-DD)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: C.inputBg, color: C.text, borderColor: C.border }]}
                value={date}
                onChangeText={setDate}
                placeholder="2025-06-15"
                placeholderTextColor={C.textSub}
                keyboardType="numbers-and-punctuation"
              />

              <Text style={[styles.label, { color: C.textSub }]}>Typ</Text>
              <View style={styles.typeRow}>
                {TYPES.map((t) => {
                  const cfg = TYPE_CONFIG[t];
                  return (
                    <TouchableOpacity
                      key={t}
                      style={[
                        styles.typeChip,
                        { borderColor: cfg.color },
                        type === t && { backgroundColor: cfg.color },
                      ]}
                      onPress={() => setType(t)}
                    >
                      <Text style={{ fontSize: 16 }}>{cfg.icon}</Text>
                      <Text style={[styles.typeChipText, { color: type === t ? "#fff" : cfg.color }]}>
                        {cfg.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.label, { color: C.textSub }]}>Opis (opcjonalnie)</Text>
              <TextInput
                style={[styles.input, styles.textarea, { backgroundColor: C.inputBg, color: C.text, borderColor: C.border }]}
                value={description}
                onChangeText={setDescription}
                placeholder="Dodatkowe informacje..."
                placeholderTextColor={C.textSub}
                multiline
                numberOfLines={3}
              />

              {formError ? (
                <Text style={[styles.errorText, { color: C.danger }]}>{formError}</Text>
              ) : null}

              <View style={styles.modalBtns}>
                <TouchableOpacity
                  style={[styles.cancelBtn, { borderColor: C.border }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={[styles.cancelText, { color: C.textSub }]}>Anuluj</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: C.primary }]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  <Text style={styles.saveText}>{saving ? "Zapisuję..." : "Dodaj"}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 40 },
  addBtn: {
    marginHorizontal: 16, marginTop: 8, marginBottom: 4,
    padding: 14, borderRadius: 12, alignItems: "center",
  },
  addBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  list: { padding: 16, gap: 12 },
  card: {
    flexDirection: "row", borderRadius: 14, borderWidth: 1,
    overflow: "hidden", shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07,
    shadowRadius: 4, elevation: 2,
  },
  leftBar: { width: 5 },
  iconBox: { width: 52, justifyContent: "center", alignItems: "center" },
  icon: { fontSize: 22 },
  body: { flex: 1, padding: 12 },
  cardTitle: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  cardDate: { fontSize: 12, fontWeight: "600", marginBottom: 4, textTransform: "capitalize" },
  cardDesc: { fontSize: 13, lineHeight: 18, marginBottom: 6 },
  typeBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  typeText: { fontSize: 11, fontWeight: "700" },
  deleteBtn: { padding: 14, justifyContent: "center" },
  overlay: { flex: 1, backgroundColor: "#00000066", justifyContent: "flex-end" },
  modal: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, maxHeight: "90%",
  },
  modalTitle: { fontSize: 18, fontWeight: "800", marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1, borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 10, fontSize: 15,
  },
  textarea: { height: 80, textAlignVertical: "top" },
  typeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  typeChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 2,
  },
  typeChipText: { fontSize: 12, fontWeight: "700" },
  errorText: { marginTop: 8, fontSize: 13, fontWeight: "600" },
  modalBtns: { flexDirection: "row", gap: 12, marginTop: 20, marginBottom: 8 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 10, borderWidth: 1, alignItems: "center" },
  cancelText: { fontSize: 15, fontWeight: "600" },
  saveBtn: { flex: 1, padding: 14, borderRadius: 10, alignItems: "center" },
  saveText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
