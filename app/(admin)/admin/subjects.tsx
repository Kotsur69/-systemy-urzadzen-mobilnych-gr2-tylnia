import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import SafeAreaContainer from "@/src/components/SafeAreaContainer";
import {
  getAllSubjects,
  addSubject,
  updateSubject,
  deleteSubject,
  type Subject,
} from "@/src/services/subjectsApi";
import { localDb } from "@/src/services/localDb";
import type { StoredUser } from "@/src/services/localDb";

const PRESET_COLORS = [
  "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b",
  "#ef4444", "#ec4899", "#06b6d4", "#f97316",
];

const EMPTY_FORM = { name: "", description: "", teacherId: "", color: PRESET_COLORS[0] };

export default function Subjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<StoredUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [subs, users] = await Promise.all([
      getAllSubjects(),
      localDb.users.getAll(),
    ]);
    setSubjects(subs);
    setTeachers(users.filter((u) => u.role === "teacher"));
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalVisible(true);
  };

  const openEdit = (s: Subject) => {
    setEditing(s);
    setForm({ name: s.name, description: s.description, teacherId: s.teacherId, color: s.color });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { Alert.alert("Błąd", "Podaj nazwę przedmiotu"); return; }
    setSaving(true);
    try {
      if (editing) {
        await updateSubject(editing.id, form);
      } else {
        await addSubject(form);
      }
      setModalVisible(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (s: Subject) => {
    Alert.alert(
      "Usuń przedmiot",
      `Czy na pewno chcesz usunąć "${s.name}"?`,
      [
        { text: "Anuluj", style: "cancel" },
        {
          text: "Usuń",
          style: "destructive",
          onPress: async () => {
            await deleteSubject(s.id);
            await load();
          },
        },
      ]
    );
  };

  const getTeacherName = (tid: string) => {
    const t = teachers.find((u) => u.uid === tid);
    return t ? `${t.firstName} ${t.surname}` : "(brak)";
  };

  return (
    <SafeAreaContainer>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color="#1A237E" />
        </TouchableOpacity>
        <Text style={styles.title}>Przedmioty Lekcyjne</Text>
        <TouchableOpacity onPress={openAdd} style={styles.addBtn}>
          <MaterialIcons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <FlatList
          data={subjects}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.empty}>Brak przedmiotów. Dodaj pierwszy!</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={[styles.colorBar, { backgroundColor: item.color }]} />
              <View style={styles.cardBody}>
                <Text style={styles.cardName}>{item.name}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                <Text style={styles.cardTeacher}>
                  Nauczyciel: {getTeacherName(item.teacherId)}
                </Text>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => openEdit(item)} style={styles.iconBtn}>
                  <MaterialIcons name="edit" size={20} color="#3b82f6" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item)} style={styles.iconBtn}>
                  <MaterialIcons name="delete" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              {editing ? "Edytuj przedmiot" : "Nowy przedmiot"}
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Nazwa *</Text>
              <TextInput
                style={styles.input}
                value={form.name}
                onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
                placeholder="np. Matematyka"
                maxLength={60}
              />

              <Text style={styles.label}>Opis</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                value={form.description}
                onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
                placeholder="Krótki opis przedmiotu..."
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              <Text style={styles.label}>Nauczyciel</Text>
              {teachers.map((t) => (
                <TouchableOpacity
                  key={t.uid}
                  style={[
                    styles.teacherItem,
                    form.teacherId === t.uid && styles.teacherItemSelected,
                  ]}
                  onPress={() => setForm((f) => ({ ...f, teacherId: t.uid }))}
                >
                  <Text style={form.teacherId === t.uid ? styles.teacherTextSelected : styles.teacherText}>
                    {t.firstName} {t.surname}
                  </Text>
                  {form.teacherId === t.uid && (
                    <MaterialIcons name="check" size={18} color="#3b82f6" />
                  )}
                </TouchableOpacity>
              ))}

              <Text style={[styles.label, { marginTop: 12 }]}>Kolor</Text>
              <View style={styles.colorRow}>
                {PRESET_COLORS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.colorDot,
                      { backgroundColor: c },
                      form.color === c && styles.colorDotSelected,
                    ]}
                    onPress={() => setForm((f) => ({ ...f, color: c }))}
                  />
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => setModalVisible(false)}
                disabled={saving}
              >
                <Text style={styles.btnCancelText}>Anuluj</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnSave}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.btnSaveText}>Zapisz</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: { padding: 4, marginRight: 8 },
  title: { flex: 1, fontSize: 20, fontWeight: "bold", color: "#1A237E" },
  addBtn: {
    backgroundColor: "#3b82f6",
    borderRadius: 20,
    padding: 4,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { color: "#94a3b8", fontSize: 16 },
  list: { padding: 16, gap: 12 },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  colorBar: { width: 6 },
  cardBody: { flex: 1, padding: 14 },
  cardName: { fontSize: 16, fontWeight: "700", color: "#0f172a", marginBottom: 4 },
  cardDesc: { fontSize: 13, color: "#64748b", marginBottom: 6 },
  cardTeacher: { fontSize: 12, color: "#94a3b8" },
  cardActions: { justifyContent: "center", paddingRight: 12, gap: 8 },
  iconBtn: { padding: 4 },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: "85%",
  },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#0f172a", marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", color: "#475569", marginBottom: 6 },
  input: {
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: "#0f172a",
    backgroundColor: "#f8fafc",
    marginBottom: 14,
  },
  textarea: { minHeight: 80 },
  teacherItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 8,
  },
  teacherItemSelected: { borderColor: "#3b82f6", backgroundColor: "#eff6ff" },
  teacherText: { fontSize: 15, color: "#0f172a" },
  teacherTextSelected: { fontSize: 15, color: "#3b82f6", fontWeight: "600" },
  colorRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  colorDotSelected: { borderWidth: 3, borderColor: "#0f172a" },
  modalBtns: { flexDirection: "row", gap: 12, marginTop: 8 },
  btnCancel: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },
  btnCancelText: { color: "#64748b", fontWeight: "600", fontSize: 15 },
  btnSave: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#3b82f6",
    alignItems: "center",
  },
  btnSaveText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
