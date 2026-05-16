import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { localAuth } from "@/src/services/localAuth";
import { getConversation, sendMessage, markRead, type Message } from "@/src/services/chatApi";
import { useAppTheme } from "@/src/context/ThemeContext";

interface Props {
  partnerId: string;
  partnerName: string;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pl-PL", { day: "2-digit", month: "short" });
}

export default function ChatConversation({ partnerId, partnerName }: Props) {
  const { C } = useAppTheme();
  const me = localAuth.currentUser!;
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  const load = useCallback(async () => {
    const msgs = await getConversation(me.uid, partnerId);
    await markRead(partnerId, me.uid);
    setMessages(msgs);
    setLoading(false);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 100);
  }, [partnerId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    const msg = await sendMessage(me.uid, partnerId, text);
    setText("");
    setMessages((prev) => [...prev, msg]);
    setSending(false);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  };

  const renderMsg = ({ item, index }: { item: Message; index: number }) => {
    const isMe = item.fromId === me.uid;
    const prevMsg = messages[index - 1];
    const showDate = !prevMsg || formatDate(prevMsg.timestamp) !== formatDate(item.timestamp);

    return (
      <>
        {showDate && (
          <Text style={[styles.dateLabel, { color: C.textSub }]}>
            {formatDate(item.timestamp)}
          </Text>
        )}
        <View style={[styles.bubble, isMe ? styles.bubbleMe : [styles.bubbleThem, { backgroundColor: C.surface }]]}>
          <Text style={[styles.bubbleText, { color: isMe ? "#fff" : C.text }]}>{item.text}</Text>
          <Text style={[styles.bubbleTime, { color: isMe ? "rgba(255,255,255,0.7)" : C.textSub }]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={26} color={C.primary} />
        </TouchableOpacity>
        <View style={[styles.avatar, { backgroundColor: C.primary + "20" }]}>
          <Text style={[styles.avatarText, { color: C.primary }]}>
            {partnerName.split(" ").map((w) => w[0]).join("").slice(0, 2)}
          </Text>
        </View>
        <Text style={[styles.headerName, { color: C.text }]}>{partnerName}</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={C.primary} size="large" />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMsg}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={[styles.empty, { color: C.textSub }]}>
                Brak wiadomości. Napisz coś!
              </Text>
            }
          />
        )}

        {/* Input */}
        <View style={[styles.inputRow, { backgroundColor: C.surface, borderTopColor: C.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: C.bg, color: C.text, borderColor: C.border }]}
            value={text}
            onChangeText={setText}
            placeholder="Wpisz wiadomość..."
            placeholderTextColor={C.textSub}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: text.trim() ? C.primary : C.border }]}
            onPress={handleSend}
            disabled={!text.trim() || sending}
          >
            <MaterialIcons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  backBtn: { padding: 2 },
  avatar: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  avatarText: { fontSize: 14, fontWeight: "700" },
  headerName: { fontSize: 17, fontWeight: "700", flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { padding: 16, gap: 4 },
  dateLabel: { textAlign: "center", fontSize: 12, marginVertical: 8 },
  bubble: {
    maxWidth: "75%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    marginVertical: 2,
  },
  bubbleMe: {
    alignSelf: "flex-end",
    backgroundColor: "#3b82f6",
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  bubbleTime: { fontSize: 11, marginTop: 4, textAlign: "right" },
  empty: { textAlign: "center", marginTop: 60, fontSize: 15 },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 10,
    gap: 8,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 120,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
});
