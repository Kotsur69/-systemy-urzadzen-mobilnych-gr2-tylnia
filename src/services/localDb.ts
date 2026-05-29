import AsyncStorage from "@react-native-async-storage/async-storage";
import type UserData from "@/src/models/UserData";

export interface StoredUser extends UserData {
  password: string;
}

export interface StoredSubject {
  id: string;
  name: string;
  description: string;
  teacherId: string;
  color: string;
}

export interface StoredTask {
  id: string;
  title: string;
  userId: string;
  teacherId: string;
  subjectId?: string;
  rate: number | null;
  comment: string;
  commited: boolean;
  taskContent: string;
  answerContent: string;
  date: string;
}

export interface StoredAttendance {
  id: string;
  studentId: string;
  date: string;
  present: boolean;
  teacherId: string;
}

export interface StoredMessage {
  id: string;
  fromId: string;
  toId: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface StoredScheduleEntry {
  id: string;
  subjectId: string;
  dayOfWeek: number; // 0=Mon … 4=Fri
  startTime: string; // "08:00"
  endTime: string;   // "09:30"
  room: string;
  teacherId: string;
}

export interface StoredEvent {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  type: "exam" | "holiday" | "meeting" | "other";
}

const KEYS = {
  USERS: "@db:users",
  TASKS: "@db:tasks",
  ATTENDANCE: "@db:attendance",
  SUBJECTS: "@db:subjects",
  MESSAGES: "@db:messages",
  SCHEDULE: "@db:schedule",
  EVENTS: "@db:events",
  INITIALIZED: "@db:initialized:v5",
};

async function getAll<T>(key: string): Promise<T[]> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}
async function setAll<T>(key: string, items: T[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(items));
}

export const localDb = {
  isInitialized: async () =>
    (await AsyncStorage.getItem(KEYS.INITIALIZED)) === "true",
  markInitialized: () => AsyncStorage.setItem(KEYS.INITIALIZED, "true"),

  users: {
    getAll: (): Promise<StoredUser[]> => getAll<StoredUser>(KEYS.USERS),
    setAll: (items: StoredUser[]) => setAll(KEYS.USERS, items),
    getById: async (uid: string) => {
      const all = await getAll<StoredUser>(KEYS.USERS);
      return all.find((u) => u.uid === uid) ?? null;
    },
    getByEmail: async (email: string) => {
      const all = await getAll<StoredUser>(KEYS.USERS);
      return all.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
    },
    add: async (user: StoredUser) => {
      const all = await getAll<StoredUser>(KEYS.USERS);
      await setAll(KEYS.USERS, [...all, user]);
    },
    update: async (uid: string, updates: Partial<StoredUser>) => {
      const all = await getAll<StoredUser>(KEYS.USERS);
      const idx = all.findIndex((u) => u.uid === uid);
      if (idx !== -1) { all[idx] = { ...all[idx], ...updates }; await setAll(KEYS.USERS, all); }
    },
  },

  subjects: {
    getAll: (): Promise<StoredSubject[]> => getAll<StoredSubject>(KEYS.SUBJECTS),
    setAll: (items: StoredSubject[]) => setAll(KEYS.SUBJECTS, items),
    getById: async (id: string) => {
      const all = await getAll<StoredSubject>(KEYS.SUBJECTS);
      return all.find((s) => s.id === id) ?? null;
    },
    getByTeacherId: async (teacherId: string) => {
      const all = await getAll<StoredSubject>(KEYS.SUBJECTS);
      return all.filter((s) => s.teacherId === teacherId);
    },
    add: async (subject: StoredSubject) => {
      const all = await getAll<StoredSubject>(KEYS.SUBJECTS);
      await setAll(KEYS.SUBJECTS, [...all, subject]);
    },
    update: async (id: string, updates: Partial<StoredSubject>) => {
      const all = await getAll<StoredSubject>(KEYS.SUBJECTS);
      const idx = all.findIndex((s) => s.id === id);
      if (idx !== -1) { all[idx] = { ...all[idx], ...updates }; await setAll(KEYS.SUBJECTS, all); }
    },
    remove: async (id: string) => {
      const all = await getAll<StoredSubject>(KEYS.SUBJECTS);
      await setAll(KEYS.SUBJECTS, all.filter((s) => s.id !== id));
    },
  },

  tasks: {
    getAll: (): Promise<StoredTask[]> => getAll<StoredTask>(KEYS.TASKS),
    setAll: (items: StoredTask[]) => setAll(KEYS.TASKS, items),
    getById: async (id: string) => {
      const all = await getAll<StoredTask>(KEYS.TASKS);
      return all.find((t) => t.id === id) ?? null;
    },
    getByUserId: async (userId: string) => {
      const all = await getAll<StoredTask>(KEYS.TASKS);
      return all.filter((t) => t.userId === userId);
    },
    getByTeacherId: async (teacherId: string) => {
      const all = await getAll<StoredTask>(KEYS.TASKS);
      return all.filter((t) => t.teacherId === teacherId);
    },
    add: async (task: StoredTask) => {
      const all = await getAll<StoredTask>(KEYS.TASKS);
      await setAll(KEYS.TASKS, [...all, task]);
    },
    update: async (id: string, updates: Partial<StoredTask>) => {
      const all = await getAll<StoredTask>(KEYS.TASKS);
      const idx = all.findIndex((t) => t.id === id);
      if (idx !== -1) { all[idx] = { ...all[idx], ...updates }; await setAll(KEYS.TASKS, all); }
    },
  },

  attendance: {
    getAll: (): Promise<StoredAttendance[]> => getAll<StoredAttendance>(KEYS.ATTENDANCE),
    setAll: (items: StoredAttendance[]) => setAll(KEYS.ATTENDANCE, items),
    getByStudentId: async (studentId: string) => {
      const all = await getAll<StoredAttendance>(KEYS.ATTENDANCE);
      return all.filter((a) => a.studentId === studentId).sort((a, b) => b.date.localeCompare(a.date));
    },
    getByDate: async (date: string) => {
      const all = await getAll<StoredAttendance>(KEYS.ATTENDANCE);
      return all.filter((a) => a.date === date);
    },
    add: async (record: StoredAttendance) => {
      const all = await getAll<StoredAttendance>(KEYS.ATTENDANCE);
      await setAll(KEYS.ATTENDANCE, [...all, record]);
    },
    // Zapisz obecność dla danego ucznia i dnia — nadpisuje istniejący wpis lub tworzy nowy.
    upsert: async (record: StoredAttendance) => {
      const all = await getAll<StoredAttendance>(KEYS.ATTENDANCE);
      const idx = all.findIndex(
        (a) => a.studentId === record.studentId && a.date === record.date
      );
      if (idx !== -1) {
        all[idx] = { ...all[idx], present: record.present, teacherId: record.teacherId };
      } else {
        all.push(record);
      }
      await setAll(KEYS.ATTENDANCE, all);
    },
  },

  messages: {
    getAll: (): Promise<StoredMessage[]> => getAll<StoredMessage>(KEYS.MESSAGES),
    setAll: (items: StoredMessage[]) => setAll(KEYS.MESSAGES, items),
    getConversation: async (uid1: string, uid2: string) => {
      const all = await getAll<StoredMessage>(KEYS.MESSAGES);
      return all
        .filter((m) => (m.fromId === uid1 && m.toId === uid2) || (m.fromId === uid2 && m.toId === uid1))
        .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    },
    add: async (msg: StoredMessage) => {
      const all = await getAll<StoredMessage>(KEYS.MESSAGES);
      await setAll(KEYS.MESSAGES, [...all, msg]);
    },
    getLastPerConversation: async (userId: string) => {
      const all = await getAll<StoredMessage>(KEYS.MESSAGES);
      const relevant = all
        .filter((m) => m.fromId === userId || m.toId === userId)
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      const seen = new Set<string>();
      const result: StoredMessage[] = [];
      for (const m of relevant) {
        const partner = m.fromId === userId ? m.toId : m.fromId;
        if (!seen.has(partner)) { seen.add(partner); result.push(m); }
      }
      return result;
    },
    getUnreadCount: async (toId: string) => {
      const all = await getAll<StoredMessage>(KEYS.MESSAGES);
      return all.filter((m) => m.toId === toId && !m.read).length;
    },
    markRead: async (fromId: string, toId: string) => {
      const all = await getAll<StoredMessage>(KEYS.MESSAGES);
      const updated = all.map((m) =>
        m.fromId === fromId && m.toId === toId ? { ...m, read: true } : m
      );
      await setAll(KEYS.MESSAGES, updated);
    },
  },

  schedule: {
    getAll: (): Promise<StoredScheduleEntry[]> => getAll<StoredScheduleEntry>(KEYS.SCHEDULE),
    setAll: (items: StoredScheduleEntry[]) => setAll(KEYS.SCHEDULE, items),
    getByDay: async (dayOfWeek: number) => {
      const all = await getAll<StoredScheduleEntry>(KEYS.SCHEDULE);
      return all.filter((e) => e.dayOfWeek === dayOfWeek).sort((a, b) => a.startTime.localeCompare(b.startTime));
    },
  },

  events: {
    getAll: (): Promise<StoredEvent[]> => getAll<StoredEvent>(KEYS.EVENTS),
    setAll: (items: StoredEvent[]) => setAll(KEYS.EVENTS, items),
    getUpcoming: async () => {
      const all = await getAll<StoredEvent>(KEYS.EVENTS);
      const today = new Date().toISOString().slice(0, 10);
      return all.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
    },
    add: async (event: StoredEvent) => {
      const all = await getAll<StoredEvent>(KEYS.EVENTS);
      await setAll(KEYS.EVENTS, [...all, event]);
    },
    remove: async (id: string) => {
      const all = await getAll<StoredEvent>(KEYS.EVENTS);
      await setAll(KEYS.EVENTS, all.filter((e) => e.id !== id));
    },
  },
};
