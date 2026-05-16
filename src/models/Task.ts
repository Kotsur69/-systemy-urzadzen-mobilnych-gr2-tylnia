export default interface Task {
  id: string;
  title: string;
  userId: string;
  teacherId: string;
  teacherName?: string;
  teacherSpecialty?: string;
  rate: number | null;
  comment: string;
  commited: boolean;
  taskContent: string;
  answerContent: string;
  date?: string;
}
