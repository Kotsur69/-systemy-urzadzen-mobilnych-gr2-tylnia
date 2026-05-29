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

export type StudentAttendanceForDate = {
  uid: string;
  firstName: string;
  surname: string;
  present: boolean; // domyślnie true, dopóki nauczyciel nie zaznaczy inaczej
  recorded: boolean; // czy istnieje już wpis dla tego dnia
};

/**
 * Zwraca listę wszystkich uczniów wraz z ich statusem obecności w danym dniu.
 * Uczniowie bez wpisu otrzymują domyślnie present = true (recorded = false).
 */
export async function getStudentsAttendanceForDate(
  date: string
): Promise<StudentAttendanceForDate[]> {
  const [users, dayRecords] = await Promise.all([
    localDb.users.getAll(),
    localDb.attendance.getByDate(date),
  ]);
  const byStudent = new Map(dayRecords.map((r) => [r.studentId, r]));
  return users
    .filter((u) => u.role === "student")
    .map((u) => {
      const rec = byStudent.get(u.uid);
      return {
        uid: u.uid,
        firstName: u.firstName,
        surname: u.surname,
        present: rec ? rec.present : true,
        recorded: !!rec,
      };
    });
}

/** Zapisuje (lub nadpisuje) obecność ucznia w danym dniu. */
export async function setAttendance(
  studentId: string,
  date: string,
  present: boolean,
  teacherId: string
): Promise<void> {
  await localDb.attendance.upsert({
    id: `att-${studentId}-${date}`,
    studentId,
    date,
    present,
    teacherId,
  });
}

/** Zapisuje frekwencję dla wielu uczniów naraz (jeden dzień). */
export async function saveAttendanceBatch(
  date: string,
  teacherId: string,
  entries: { studentId: string; present: boolean }[]
): Promise<void> {
  for (const e of entries) {
    await setAttendance(e.studentId, date, e.present, teacherId);
  }
}
