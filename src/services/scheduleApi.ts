import { localDb, type StoredScheduleEntry } from "./localDb";

export type ScheduleEntry = StoredScheduleEntry;

export const DAY_NAMES = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek"];

export const getScheduleForDay = (dayOfWeek: number) =>
  localDb.schedule.getByDay(dayOfWeek);

export const getFullSchedule = () => localDb.schedule.getAll();
