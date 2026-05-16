import { localDb, type StoredSubject } from "./localDb";

export type Subject = StoredSubject;

export const getAllSubjects = (): Promise<Subject[]> =>
  localDb.subjects.getAll();

export const getSubjectsByTeacher = (teacherId: string): Promise<Subject[]> =>
  localDb.subjects.getByTeacherId(teacherId);

export const getSubjectById = (id: string): Promise<Subject | null> =>
  localDb.subjects.getById(id);

export const addSubject = async (
  data: Omit<Subject, "id">
): Promise<Subject> => {
  const subject: Subject = { ...data, id: `sub-${Date.now()}` };
  await localDb.subjects.add(subject);
  return subject;
};

export const updateSubject = (
  id: string,
  data: Partial<Omit<Subject, "id">>
): Promise<void> => localDb.subjects.update(id, data);

export const deleteSubject = (id: string): Promise<void> =>
  localDb.subjects.remove(id);
