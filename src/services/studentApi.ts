import { localDb } from "./localDb";
import { getUserDataByUid } from "./userApi";
import type Task from "@/src/models/Task";

export type RatingSubject = {
  uid: string;
  title: string;
  commited: boolean;
  taskContent: string;
  rate: number;
  comment: string;
  teacherName: string;
};

export async function getRatingSubjects(
  userId: string
): Promise<RatingSubject[]> {
  try {
    const tasks = await localDb.tasks.getByUserId(userId);
    const results: RatingSubject[] = [];

    for (const t of tasks) {
      const teacher = await getUserDataByUid(t.teacherId);
      results.push({
        uid: t.id,
        title: t.title,
        taskContent: t.taskContent,
        commited: t.commited,
        rate: t.rate ?? 0,
        comment: t.comment,
        teacherName: teacher
          ? `${teacher.firstName} ${teacher.surname}`
          : "Nieznany nauczyciel",
      });
    }

    return results;
  } catch (error) {
    console.error("Błąd podczas pobierania ocen:", error);
    return [];
  }
}

export async function getTasksByStudent(studentId: string): Promise<Task[]> {
  try {
    const tasks = await localDb.tasks.getByUserId(studentId);
    const result: Task[] = [];

    for (const t of tasks) {
      const teacher = await getUserDataByUid(t.teacherId);
      result.push({
        id: t.id,
        title: t.title,
        userId: t.userId,
        teacherId: t.teacherId,
        teacherName: teacher
          ? `${teacher.firstName} ${teacher.surname}`
          : "Nieznany nauczyciel",
        teacherSpecialty: teacher?.specialty,
        rate: t.rate,
        comment: t.comment,
        commited: t.commited,
        taskContent: t.taskContent,
        answerContent: t.answerContent,
        date: t.date,
      });
    }

    return result;
  } catch (error) {
    console.error("Błąd podczas pobierania zadań studenta:", error);
    return [];
  }
}

export async function getSingleTaskById(taskId: string): Promise<Task | null> {
  try {
    const t = await localDb.tasks.getById(taskId);
    if (!t) return null;
    const teacher = await getUserDataByUid(t.teacherId);
    return {
      id: t.id,
      title: t.title,
      userId: t.userId,
      teacherId: t.teacherId,
      teacherName: teacher
        ? `${teacher.firstName} ${teacher.surname}`
        : "Nieznany nauczyciel",
      teacherSpecialty: teacher?.specialty,
      rate: t.rate,
      comment: t.comment,
      commited: t.commited,
      taskContent: t.taskContent,
      answerContent: t.answerContent,
      date: t.date,
    };
  } catch (error) {
    console.error("Błąd podczas pobierania zadania:", error);
    return null;
  }
}

export async function submitTaskAnswer(
  taskId: string,
  answerContent: string
): Promise<void> {
  try {
    await localDb.tasks.update(taskId, { answerContent });
  } catch (error) {
    console.error("Błąd podczas wysyłania odpowiedzi:", error);
    throw new Error("Nie udało się zapisać odpowiedzi.");
  }
}
