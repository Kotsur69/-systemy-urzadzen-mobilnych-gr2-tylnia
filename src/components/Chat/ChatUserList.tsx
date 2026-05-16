import UserData from "@/src/models/UserData";
import { UserRole } from "@/src/models/UserRole";
import { getAllUsers } from "@/src/services/userApi";
import { localAuth } from "@/src/services/localAuth";
import { getLastPerConversation, type Message } from "@/src/services/chatApi";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/src/context/ThemeContext";

const ROLE_COLORS: Record<string, string> = {
  admin: "#E91E63",
  teacher: "#FF9800",
  student: "#4CAF50",
};

const ChatUserList = () => {
  const { C } = useAppTheme();
  const me = localAuth.currentUser;
  const [users, setUsers] = useState<UserData[]>([]);
  const [filtered, setFiltered] = useState<UserData[]>([]);
  const [lastMsgs, setLastMsgs] = useState<Record<string, Message>>({});
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    let result = users;
    if (searchText) {
      result = result.filter(
        (u) =>
          u.surname.toLowerCase().includes(searchText.toLowerCase()) ||
          u.firstName.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    if (roleFilter !== "all") result = result.filter((u) => u.role === roleFilter);
    setFiltered(result);
  }, [users, searchText, roleFilter]);

  const load = async () => {
    setLoading(true);
    const [data, msgs] = await Promise.all([
      getAllUsers(),
      me ? getLastPerConversation(me.uid) : Promise.resolve([]),
    ]);
    const activeOthers = data.filter((u: UserData) => u.active && u.uid !== me?.uid);
    setUsers(activeOthers);

    const map: Record<string, Message> = {};
    msgs.forEach((m) => {
      const partner = m.fromId === me?.uid ? m.toId : m.fromId;
      map[partner] = m;
    });
    setLastMsgs(map);
    setLoading(false);
  };

  const openChat = (user: UserData) => {
    router.push({
      pathname: "/chat",
      params: { id: user.uid, title: `${user.firstName} ${user.surname}` },
    });
  };

  const renderItem = ({ item }: { item: UserData }) => {
    const last = lastMsgs[item.uid];
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}
        onPress={() => openChat(item)}
      >
        <View style={[styles.avatar, { backgroundColor: (ROLE_COLORS[item.role ?? ""] ?? "#888") + "20" }]}>
          <Text style={[styles.avatarText, { color: ROLE_COLORS[item.role ?? ""] ?? C.primary }]}>
            {item.firstName.charAt(0)}{item.surname.charAt(0)}
          </Text>
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: C.text }]}>
            {item.firstName} {item.surname}
          </Text>
          <Text style={[styles.preview, { color: C.textSub }]} numberOfLines={1}>
            {last ? last.text : item.email}
          </Text>
        </View>
        <View style={styles.right}>
          <View style={[styles.badge, { backgroundColor: ROLE_COLORS[item.role ?? ""] ?? "#888" }]}>
            <Text style={styles.badgeText}>{item.role}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color={C.textSub} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]}>
      <View style={[styles.header, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={26} color={C.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: C.text }]}>Wiadomości</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={[styles.filters, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <TextInput
          style={[styles.search, { backgroundColor: C.inputBg, color: C.text, borderColor: C.border }]}
          placeholder="Szukaj osoby..."
          placeholderTextColor={C.textSub}
          value={searchText}
          onChangeText={setSearchText}
        />
        <View style={styles.chips}>
          {(["all", "student", "teacher", "admin"] as const).map((role) => (
            <TouchableOpacity
              key={role}
              style={[styles.chip, roleFilter === role && { backgroundColor: C.primary }]}
              onPress={() => setRoleFilter(role)}
            >
              <Text style={[styles.chipText, roleFilter === role && { color: "#fff" }]}>
                {role === "all" ? "Wszyscy" : role}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={C.primary} style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item) => item.uid}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: C.textSub }]}>Nie znaleziono użytkowników</Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default ChatUserList;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 2, marginRight: 8 },
  title: { flex: 1, fontSize: 20, fontWeight: "800", textAlign: "center" },
  filters: { padding: 12, borderBottomWidth: 1 },
  search: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 9,
    fontSize: 15,
    marginBottom: 10,
  },
  chips: { flexDirection: "row", gap: 8 },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#e2e8f0",
  },
  chipText: { fontSize: 13, fontWeight: "600", color: "#475569" },
  list: { padding: 14, gap: 10 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 16, fontWeight: "700" },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: "700", marginBottom: 2 },
  preview: { fontSize: 13 },
  right: { alignItems: "flex-end", gap: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "700", textTransform: "uppercase" },
  empty: { textAlign: "center", marginTop: 40, fontSize: 15 },
});
