import type {
  StoredUser,
  StoredTask,
  StoredAttendance,
  StoredSubject,
  StoredMessage,
  StoredScheduleEntry,
  StoredEvent,
} from "@/src/services/localDb";

export const SEED_USERS: StoredUser[] = [
  { uid: "admin-1",   email: "admin@school.pl",    password: "admin123",   firstName: "Adam",  surname: "Adminski",   role: "admin",   active: true },
  { uid: "teacher-1", email: "teacher@school.pl",  password: "teacher123", firstName: "Jan",   surname: "Kowalski",   role: "teacher", active: true, specialty: "Informatyka" },
  { uid: "student-1", email: "student@school.pl",  password: "student123", firstName: "Anna",  surname: "Nowak",      role: "student", active: true },
  { uid: "student-2", email: "student2@school.pl", password: "student123", firstName: "Piotr", surname: "Wiśniewski", role: "student", active: true },
];

export const SEED_SUBJECTS: StoredSubject[] = [
  { id: "sub-1", name: "Matematyka", description: "Algebra, geometria analityczna, rachunek różniczkowy", teacherId: "teacher-1", color: "#3b82f6" },
  { id: "sub-2", name: "Informatyka", description: "Algorytmy, struktury danych, programowanie obiektowe", teacherId: "teacher-1", color: "#8b5cf6" },
  { id: "sub-3", name: "Fizyka", description: "Mechanika klasyczna, termodynamika, elektryczność", teacherId: "teacher-1", color: "#10b981" },
  { id: "sub-4", name: "Historia", description: "Historia Polski, historia powszechna nowożytna", teacherId: "teacher-1", color: "#f59e0b" },
  { id: "sub-5", name: "Język Polski", description: "Literatura polska, gramatyka, analiza tekstów", teacherId: "teacher-1", color: "#ef4444" },
];

export const SEED_SCHEDULE: StoredScheduleEntry[] = [
  { id: "sch-1", subjectId: "sub-1", dayOfWeek: 0, startTime: "08:00", endTime: "09:30", room: "201", teacherId: "teacher-1" },
  { id: "sch-2", subjectId: "sub-2", dayOfWeek: 0, startTime: "10:00", endTime: "11:30", room: "115", teacherId: "teacher-1" },
  { id: "sch-3", subjectId: "sub-3", dayOfWeek: 1, startTime: "08:00", endTime: "09:30", room: "301", teacherId: "teacher-1" },
  { id: "sch-4", subjectId: "sub-5", dayOfWeek: 1, startTime: "10:00", endTime: "11:30", room: "203", teacherId: "teacher-1" },
  { id: "sch-5", subjectId: "sub-4", dayOfWeek: 2, startTime: "09:45", endTime: "11:15", room: "102", teacherId: "teacher-1" },
  { id: "sch-6", subjectId: "sub-1", dayOfWeek: 2, startTime: "12:00", endTime: "13:30", room: "201", teacherId: "teacher-1" },
  { id: "sch-7", subjectId: "sub-2", dayOfWeek: 3, startTime: "08:00", endTime: "09:30", room: "115", teacherId: "teacher-1" },
  { id: "sch-8", subjectId: "sub-3", dayOfWeek: 4, startTime: "08:00", endTime: "09:30", room: "301", teacherId: "teacher-1" },
  { id: "sch-9", subjectId: "sub-5", dayOfWeek: 4, startTime: "10:00", endTime: "11:30", room: "203", teacherId: "teacher-1" },
];

export const SEED_EVENTS: StoredEvent[] = [
  { id: "ev-1", title: "Sprawdzian z Matematyki", description: "Cały materiał z semestru — algebra i geometria analityczna", date: "2025-05-28", type: "exam" },
  { id: "ev-2", title: "Dzień wolny od zajęć", description: "Rekolekcje szkolne — brak lekcji", date: "2025-06-02", type: "holiday" },
  { id: "ev-3", title: "Zebranie z rodzicami", description: "Informacja o wynikach semestru — sala 001, godz. 17:00", date: "2025-06-05", type: "meeting" },
  { id: "ev-4", title: "Egzamin z Informatyki", description: "Projekt semestralny + test pisemny z algorytmów", date: "2025-06-12", type: "exam" },
  { id: "ev-5", title: "Zakończenie roku szkolnego", description: "Uroczyste zakończenie roku w auli o godzinie 10:00", date: "2025-06-27", type: "other" },
];

export const SEED_MESSAGES: StoredMessage[] = [
  { id: "msg-1", fromId: "teacher-1", toId: "student-1", text: "Dzień dobry Jan, proszę o oddanie zaległego zadania z baz danych SQL do końca tygodnia.", timestamp: "2025-05-10T10:00:00Z", read: true },
  { id: "msg-2", fromId: "student-1", toId: "teacher-1", text: "Dzień dobry Pani Kowalska, postaram się oddać jutro rano. Dziękuję za przypomnienie.", timestamp: "2025-05-10T12:30:00Z", read: true },
  { id: "msg-3", fromId: "teacher-1", toId: "student-1", text: "Dobrze, czekam. Powodzenia z zadaniem! Pamiętaj o komentarzach w kodzie SQL.", timestamp: "2025-05-10T13:15:00Z", read: false },
  { id: "msg-4", fromId: "teacher-1", toId: "student-2", text: "Mario, świetna robota z zadaniem z React Native! Projekt był bardzo dopracowany.", timestamp: "2025-05-11T09:00:00Z", read: true },
  { id: "msg-5", fromId: "student-2", toId: "teacher-1", text: "Dziękuję bardzo, Pani Kowalska! Bardzo lubiłam to zadanie.", timestamp: "2025-05-11T10:00:00Z", read: true },
];

export const SEED_TASKS: StoredTask[] = [
  { id: "task-1", title: "Algorytmy sortowania", subjectId: "sub-2", userId: "student-1", teacherId: "teacher-1", rate: 85, comment: "Bardzo dobra robota! Kod jest czytelny i dobrze udokumentowany.", commited: true, taskContent: "Zaimplementuj algorytmy quicksort oraz mergesort w TypeScript. Porównaj ich złożoność czasową i przestrzenną. Napisz testy jednostkowe.", answerContent: "Oto moje rozwiązanie z komentarzami i testami jednostkowymi...", date: "2025-03-15T10:00:00.000Z" },
  { id: "task-2", title: "Bazy danych SQL", subjectId: "sub-2", userId: "student-1", teacherId: "teacher-1", rate: null, comment: "", commited: false, taskContent: "Stwórz schemat relacyjnej bazy danych dla systemu bibliotecznego. Uwzględnij tabele: books, authors, members, loans. Napisz minimum 5 zapytań SQL.", answerContent: "", date: "2025-04-01T09:00:00.000Z" },
  { id: "task-3", title: "React Native UI", subjectId: "sub-2", userId: "student-2", teacherId: "teacher-1", rate: 92, comment: "Świetny interfejs! Dobra obsługa błędów i walidacja. Brawo.", commited: true, taskContent: "Stwórz ekran logowania z walidacją formularza w React Native. Zaimplementuj stan błędów i wskaźnik ładowania.", answerContent: "Stworzyłam ekran logowania z pełną walidacją...", date: "2025-04-10T11:00:00.000Z" },
  { id: "task-4", title: "Programowanie obiektowe", subjectId: "sub-2", userId: "student-2", teacherId: "teacher-1", rate: null, comment: "", commited: false, taskContent: "Zaprojektuj hierarchię klas dla systemu zarządzania uczelnią. Uwzględnij klasy: Person, Student, Teacher, Course.", answerContent: "", date: "2025-04-20T08:00:00.000Z" },
  { id: "task-5", title: "Równania kwadratowe", subjectId: "sub-1", userId: "student-1", teacherId: "teacher-1", rate: 78, comment: "Dobra praca, ale sprawdź jeszcze metodę wyróżnika dla δ < 0.", commited: true, taskContent: "Rozwiąż zestaw 10 równań kwadratowych metodą wyróżnika oraz przez rozkład na czynniki. Przedstaw pełne obliczenia.", answerContent: "Rozwiązałem wszystkie 10 równań metodą wyróżnika...", date: "2025-04-25T10:00:00.000Z" },
  { id: "task-6", title: "Prawa Newtona — zadania", subjectId: "sub-3", userId: "student-1", teacherId: "teacher-1", rate: null, comment: "", commited: false, taskContent: "Rozwiąż 5 zadań z mechaniki klasycznej dotyczących trzech praw Newtona. Narysuj schematy sił dla każdego zadania.", answerContent: "", date: "2025-05-10T09:00:00.000Z" },
  { id: "task-7", title: "II Wojna Światowa", subjectId: "sub-4", userId: "student-2", teacherId: "teacher-1", rate: 88, comment: "Świetna analiza przyczyn i skutków. Dodaj więcej dat.", commited: true, taskContent: "Napisz esej (min. 600 słów) analizujący przyczyny, przebieg i skutki II Wojny Światowej ze szczególnym uwzględnieniem Polski.", answerContent: "II Wojna Światowa wybuchła 1 września 1939 roku, kiedy Niemcy napadły na Polskę...", date: "2025-04-30T11:00:00.000Z" },
  { id: "task-8", title: "Analiza wiersza 'Lokomotywa'", subjectId: "sub-5", userId: "student-2", teacherId: "teacher-1", rate: null, comment: "", commited: false, taskContent: "Dokonaj analizy i interpretacji wiersza 'Lokomotywa' Juliana Tuwima. Omów środki stylistyczne, rytm, rym i przesłanie utworu.", answerContent: "", date: "2025-05-12T08:00:00.000Z" },
];

export const SEED_ATTENDANCE: StoredAttendance[] = [
  { id: "att-1",  studentId: "student-1", date: "2025-04-07", present: true,  teacherId: "teacher-1" },
  { id: "att-2",  studentId: "student-1", date: "2025-04-08", present: true,  teacherId: "teacher-1" },
  { id: "att-3",  studentId: "student-1", date: "2025-04-09", present: false, teacherId: "teacher-1" },
  { id: "att-4",  studentId: "student-1", date: "2025-04-10", present: true,  teacherId: "teacher-1" },
  { id: "att-5",  studentId: "student-1", date: "2025-04-11", present: true,  teacherId: "teacher-1" },
  { id: "att-6",  studentId: "student-1", date: "2025-04-14", present: true,  teacherId: "teacher-1" },
  { id: "att-7",  studentId: "student-1", date: "2025-04-15", present: true,  teacherId: "teacher-1" },
  { id: "att-8",  studentId: "student-1", date: "2025-04-16", present: false, teacherId: "teacher-1" },
  { id: "att-9",  studentId: "student-1", date: "2025-04-17", present: true,  teacherId: "teacher-1" },
  { id: "att-10", studentId: "student-1", date: "2025-04-22", present: true,  teacherId: "teacher-1" },
  { id: "att-11", studentId: "student-1", date: "2025-04-23", present: true,  teacherId: "teacher-1" },
  { id: "att-12", studentId: "student-1", date: "2025-04-24", present: true,  teacherId: "teacher-1" },
  { id: "att-13", studentId: "student-1", date: "2025-04-25", present: false, teacherId: "teacher-1" },
  { id: "att-14", studentId: "student-1", date: "2025-04-28", present: true,  teacherId: "teacher-1" },
  { id: "att-15", studentId: "student-1", date: "2025-04-29", present: true,  teacherId: "teacher-1" },
  { id: "att-16", studentId: "student-1", date: "2025-04-30", present: true,  teacherId: "teacher-1" },
  { id: "att-17", studentId: "student-1", date: "2025-05-05", present: true,  teacherId: "teacher-1" },
  { id: "att-18", studentId: "student-1", date: "2025-05-06", present: true,  teacherId: "teacher-1" },
  { id: "att-19", studentId: "student-1", date: "2025-05-07", present: false, teacherId: "teacher-1" },
  { id: "att-20", studentId: "student-1", date: "2025-05-08", present: true,  teacherId: "teacher-1" },
  { id: "att-21", studentId: "student-2", date: "2025-04-07", present: true,  teacherId: "teacher-1" },
  { id: "att-22", studentId: "student-2", date: "2025-04-08", present: false, teacherId: "teacher-1" },
  { id: "att-23", studentId: "student-2", date: "2025-04-09", present: true,  teacherId: "teacher-1" },
  { id: "att-24", studentId: "student-2", date: "2025-04-10", present: true,  teacherId: "teacher-1" },
  { id: "att-25", studentId: "student-2", date: "2025-04-14", present: true,  teacherId: "teacher-1" },
  { id: "att-26", studentId: "student-2", date: "2025-04-15", present: true,  teacherId: "teacher-1" },
  { id: "att-27", studentId: "student-2", date: "2025-04-22", present: false, teacherId: "teacher-1" },
  { id: "att-28", studentId: "student-2", date: "2025-04-23", present: false, teacherId: "teacher-1" },
  { id: "att-29", studentId: "student-2", date: "2025-04-28", present: true,  teacherId: "teacher-1" },
  { id: "att-30", studentId: "student-2", date: "2025-04-29", present: true,  teacherId: "teacher-1" },
];
