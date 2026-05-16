import { localDb, type StoredMessage } from "./localDb";

export type Message = StoredMessage;

export const getConversation = (uid1: string, uid2: string) =>
  localDb.messages.getConversation(uid1, uid2);

export const sendMessage = async (fromId: string, toId: string, text: string): Promise<Message> => {
  const msg: Message = {
    id: `msg-${Date.now()}`,
    fromId,
    toId,
    text: text.trim(),
    timestamp: new Date().toISOString(),
    read: false,
  };
  await localDb.messages.add(msg);
  return msg;
};

export const getLastPerConversation = (userId: string) =>
  localDb.messages.getLastPerConversation(userId);

export const markRead = (fromId: string, toId: string) =>
  localDb.messages.markRead(fromId, toId);
