import AsyncStorage from "@react-native-async-storage/async-storage";
import { localDb, type StoredUser } from "./localDb";
import type UserData from "@/src/models/UserData";
import {
  SEED_USERS,
  SEED_TASKS,
  SEED_ATTENDANCE,
  SEED_SUBJECTS,
  SEED_MESSAGES,
  SEED_SCHEDULE,
  SEED_EVENTS,
} from "@/src/data/seed";

const AUTH_KEY = "@auth:currentUser";

let _currentUser: StoredUser | null = null;

function toUserData(stored: StoredUser): UserData {
  const { password, ...user } = stored;
  return user;
}

export async function initAuth(): Promise<void> {
  // Wyczyść stare wersje bazy danych
  for (const oldKey of ["@db:initialized:v1", "@db:initialized:v2", "@db:initialized:v3", "@db:initialized:v4"]) {
    const old = await AsyncStorage.getItem(oldKey);
    if (old) {
      await AsyncStorage.multiRemove([
        oldKey, "@db:users", "@db:tasks", "@db:attendance",
        "@db:subjects", "@db:messages", "@db:schedule", "@db:events",
        "@auth:currentUser",
      ]);
    }
  }

  const initialized = await localDb.isInitialized();
  if (!initialized) {
    await localDb.users.setAll(SEED_USERS);
    await localDb.subjects.setAll(SEED_SUBJECTS);
    await localDb.tasks.setAll(SEED_TASKS);
    await localDb.attendance.setAll(SEED_ATTENDANCE);
    await localDb.messages.setAll(SEED_MESSAGES);
    await localDb.schedule.setAll(SEED_SCHEDULE);
    await localDb.events.setAll(SEED_EVENTS);
    await localDb.markInitialized();
  }

  const raw = await AsyncStorage.getItem(AUTH_KEY);
  _currentUser = raw ? JSON.parse(raw) : null;
}

export const localAuth = {
  get currentUser(): UserData | null {
    return _currentUser ? toUserData(_currentUser) : null;
  },

  onAuthStateChanged(
    callback: (user: UserData | null) => void
  ): () => void {
    callback(localAuth.currentUser);
    return () => {};
  },
};

export async function signIn(
  email: string,
  password: string
): Promise<UserData> {
  const user = await localDb.users.getByEmail(email);
  if (!user || user.password !== password) {
    throw new Error("Nieprawidłowy email lub hasło.");
  }
  if (!user.active) {
    throw new Error("Konto jest nieaktywne. Skontaktuj się z administratorem.");
  }
  _currentUser = user;
  await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(user));
  return toUserData(user);
}

export async function signOut(): Promise<void> {
  _currentUser = null;
  await AsyncStorage.removeItem(AUTH_KEY);
}

export async function register(
  email: string,
  password: string
): Promise<UserData> {
  const existing = await localDb.users.getByEmail(email);
  if (existing) throw new Error("Użytkownik z tym emailem już istnieje.");

  const uid = `user-${Date.now()}`;
  const newUser: StoredUser = {
    uid,
    email,
    password,
    firstName: "",
    surname: "",
    role: "student",
    active: true,
  };

  await localDb.users.add(newUser);
  _currentUser = newUser;
  await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
  return toUserData(newUser);
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  if (!_currentUser) throw new Error("Nie jesteś zalogowany.");
  if (_currentUser.password !== currentPassword) {
    const err: any = new Error("Aktualne hasło jest niepoprawne.");
    err.code = "auth/wrong-password";
    throw err;
  }
  await localDb.users.update(_currentUser.uid, { password: newPassword });
  _currentUser = null;
  await AsyncStorage.removeItem(AUTH_KEY);
}
