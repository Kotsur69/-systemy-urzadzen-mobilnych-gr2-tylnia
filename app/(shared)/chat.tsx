import { useLocalSearchParams } from "expo-router";
import ChatUserList from "@/src/components/Chat/ChatUserList";
import ChatConversation from "@/src/components/Chat/ChatConversation";

export default function ChatScreen() {
  const { id, title } = useLocalSearchParams<{ id?: string; title?: string }>();

  if (id) {
    return <ChatConversation partnerId={id} partnerName={title ?? "Rozmowa"} />;
  }

  return <ChatUserList />;
}
