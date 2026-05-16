import { localDb } from "./localDb";
import { localAuth } from "./localAuth";
import type UserData from "@/src/models/UserData";

export const getCurrentUserData = async (): Promise<UserData> => {
  const currentUser = localAuth.currentUser;
  if (!currentUser) throw new Error("No user is currently logged in");
  return currentUser;
};

export const updateCurrentUserData = async (
  data: Partial<UserData>
): Promise<void> => {
  const currentUser = localAuth.currentUser;
  if (!currentUser) throw new Error("No user is currently logged in");
  const { email, uid, ...updateData } = data;
  await localDb.users.update(currentUser.uid, updateData);
};

export const getAllUsers = async (): Promise<UserData[]> => {
  const users = await localDb.users.getAll();
  return users.map(({ password, ...user }) => user);
};

export const getUserDataByUid = async (
  uid: string
): Promise<UserData | null> => {
  const user = await localDb.users.getById(uid);
  if (!user) return null;
  const { password, ...userData } = user;
  return userData;
};

export const updateUserDataByUid = async (
  uid: string,
  data: Partial<UserData>
): Promise<void> => {
  const { email, uid: _, ...cleanData } = data as any;
  await localDb.users.update(uid, cleanData);
};

export const createNewUser = async (
  newUser: UserData,
  password: string
): Promise<void> => {
  const existing = await localDb.users.getByEmail(newUser.email);
  if (existing) throw new Error("Użytkownik z tym emailem już istnieje.");
  const uid = `user-${Date.now()}`;
  await localDb.users.add({ ...newUser, uid, password });
};

export const sendUserPasswordReset = async (email: string): Promise<void> => {
  // No-op in local mode — UI shows "check your inbox" regardless
};
