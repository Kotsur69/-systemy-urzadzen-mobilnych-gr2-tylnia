import { localDb, type StoredAttendance } from "./localDb";

export type AttendanceRecord = {
  id: string;
  date: string;
  present: boolean;
};

export type AttendanceSummary = {
  total: number;
  present: number;
  absent: number;
  percentage: number;
};

export async function getAttendanceForStudent(
  studentId: string
): Promise<AttendanceRecord[]> {
  const records = await localDb.attendance.getByStudentId(studentId);
  return records.map((r) => ({
    id: r.id,
    date: r.date,
    present: r.present,
  }));
}

export function calcSummary(records: AttendanceRecord[]): AttendanceSummary {
  const total = records.length;
  const present = records.filter((r) => r.present).length;
  const absent = total - present;
  const percentage = total === 0 ? 0 : Math.round((present / total) * 100);
  return { total, present, absent, percentage };
}
