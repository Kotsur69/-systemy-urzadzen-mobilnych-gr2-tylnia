import { localDb, type StoredTask } from "./localDb";
import type Task from "@/src/models/Task";

const toTask = (t: StoredTask): Task => ({
  id: t.id,
  title: t.title,
  userId: t.userId,
  teacherId: t.teacherId,
  rate: t.rate,
  comment: t.comment,
  commited: t.commited,
  taskContent: t.taskContent,
  answerContent: t.answerContent,
  date: t.date,
});

export { toTask as taskConverter };

export interface Student {
  uid: string;
  firstName: string;
  surname: string;
}

export async function getTasksByTeacher(teacherId: string): Promise<Task[]> {
  const tasks = await localDb.tasks.getByTeacherId(teacherId);
  return tasks.map(toTask);
}

export async function getTaskById(taskId: string): Promise<Task | null> {
  const task = await localDb.tasks.getById(taskId);
  return task ? toTask(task) : null;
}

export async function updateTaskGradeAndStatus(
  taskId: string,
  rate: number | null,
  comment: string,
  commited: boolean
): Promise<void> {
  await localDb.tasks.update(taskId, { rate, comment, commited });
}

export const createTask = async (task: {
  title: string;
  taskContent: string;
  userId: string;
  teacherId: string;
}): Promise<void> => {
  await localDb.tasks.add({
    id: `task-${Date.now()}`,
    title: task.title.trim(),
    taskContent: task.taskContent.trim(),
    userId: task.userId,
    teacherId: task.teacherId,
    rate: null,
    comment: "",
    commited: false,
    answerContent: "",
    date: new Date().toISOString(),
  });
};

/**
 * Tworzy to samo zadanie dla wielu uczniów naraz (np. dla całej grupy).
 * Każdy uczeń otrzymuje osobny, niezależny wpis zadania.
 */
export const createTaskForStudents = async (task: {
  title: string;
  taskContent: string;
  teacherId: string;
  userIds: string[];
}): Promise<number> => {
  const title = task.title.trim();
  const taskContent = task.taskContent.trim();
  const now = Date.now();
  let created = 0;

  for (const userId of task.userIds) {
    await localDb.tasks.add({
      id: `task-${now}-${userId}`,
      title,
      taskContent,
      userId,
      teacherId: task.teacherId,
      rate: null,
      comment: "",
      commited: false,
      answerContent: "",
      date: new Date().toISOString(),
    });
    created++;
  }

  return created;
};

export async function getStudents(): Promise<Student[]> {
  const users = await localDb.users.getAll();
  return users
    .filter((u) => u.role === "student")
    .map((u) => ({ uid: u.uid, firstName: u.firstName, surname: u.surname }));
}

export async function getStudentByUid(uid: string): Promise<Student | null> {
  const user = await localDb.users.getById(uid);
  if (!user) return null;
  return { uid: user.uid, firstName: user.firstName, surname: user.surname };
}
