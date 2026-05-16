# Aplikacja Mobilna — Grupa 2 Tylnia

Projekt mobilny wykonany w ramach kursu **Systemy Urządzeń Mobilnych — WSB Merito 2026/2027**.

**Grupa:** Grupa 2 Tylnia  
**Uczelnia:** WSB Merito  
**Rok akademicki:** 2026/2027

---

## Opis

Szkolna aplikacja mobilna dla uczniów, nauczycieli i administratorów.  
Działa w pełni lokalnie — **nie wymaga Firebase ani połączenia z internetem**.

Dane przechowywane są w AsyncStorage (localStorage przeglądarki lub pamięć urządzenia).

---

## Technologie

- **React Native** + **Expo SDK 54**
- **Expo Router** (nawigacja oparta na plikach)
- **AsyncStorage** (lokalna baza danych, bez serwera)
- **TypeScript**

---

## Uruchomienie (dla prowadzącego)

### Wymagania

- **Node.js 18+** — https://nodejs.org (wystarczy wersja LTS)
- npm (instaluje się razem z Node.js)

### Kroki

```bash
# 1. Przejdź do folderu projektu
cd gr4-course-hub

# 2. Zainstaluj zależności (raz)
npm install

# 3. Uruchom aplikację
npx expo start
```

Po uruchomieniu naciśnij **`w`** — aplikacja otworzy się w przeglądarce.

> **Alternatywnie na telefonie:** zeskanuj kod QR aplikacją **Expo Go** (App Store / Google Play)

---

## Konta testowe

| Rola          | Email                  | Hasło       |
|---------------|------------------------|-------------|
| Administrator | admin@school.pl        | admin123    |
| Nauczyciel    | teacher@school.pl      | teacher123  |
| Uczeń 1       | student@school.pl      | student123  |
| Uczeń 2       | student2@school.pl     | student123  |

> Jeśli logowanie nie działa — kliknij przycisk **"Resetuj dane demo"** na ekranie logowania, następnie odśwież stronę.

---

## Funkcje aplikacji

### Panel ucznia
- Oceny z zadań domowych z oceną słowną (Celujący / Bardzo dobry / Dobry / Dostateczny / Niedostateczny)
- Zadania domowe — przeglądanie treści i oddawanie odpowiedzi
- Plan lekcji — tygodniowy rozkład zajęć z podświetleniem dzisiejszego dnia
- Powiadomienia — zaległe zadania i nadchodzące wydarzenia z kolorowaniem pilności
- Terminarz — kalendarz wydarzeń szkolnych (sprawdziany, dni wolne, zebrania)
- Raport ocen — podsumowanie z wykresem i statystykami
- Czat — wiadomości z nauczycielami i innymi uczniami
- Przedmioty lekcyjne — lista z kolorem i opisem
- Obecności — frekwencja
- Profil — edycja danych, zmiana hasła, przełącznik ciemnego motywu

### Panel nauczyciela
- Lista zadań — przeglądanie, ocenianie, dodawanie komentarzy
- Statystyki — rozkład ocen, wyniki poszczególnych uczniów z paskiem postępu
- Terminarz — **dodawanie wydarzeń widocznych dla uczniów** (sprawdziany, zebrania itp.)
- Czat — rozmowy z uczniami i innymi nauczycielami
- Profil

### Panel admina
- Zarządzanie użytkownikami — dodawanie, edycja, dezaktywacja kont
- **Specjalizacja nauczyciela** — np. "Informatyka", "Matematyka" — widoczna na zadaniach ucznia
- Zarządzanie przedmiotami lekcyjnymi — pełny CRUD z wyborem koloru i przypisaniem nauczyciela

---

## Resetowanie danych

Jeśli dane wyglądają na stare lub logowanie nie działa:

**Opcja 1 (najprostsza):** Kliknij "Resetuj dane demo" na ekranie logowania → odśwież stronę.

**Opcja 2 (przeglądarka):**  
DevTools (`F12`) → Application → Local Storage → kliknij prawym → "Clear all" → odśwież.

---

## Struktura projektu

```
app/
  (student)/student/    # Ekrany ucznia (plan, powiadomienia, terminarz, raport, czat...)
  (teacher)/teacher/    # Ekrany nauczyciela (zadania, statystyki, terminarz)
  (admin)/admin/        # Ekrany admina (użytkownicy, przedmioty)
  (shared)/             # Współdzielone (czat, profil)
  auth/                 # Logowanie, rejestracja
src/
  services/             # localDb, localAuth, chatApi, eventsApi, scheduleApi...
  components/           # Komponenty UI (Chat, Student, Navigation...)
  context/              # ThemeContext (dark/light mode)
  data/                 # seed.ts — dane startowe
  models/               # Typy TypeScript (UserData, Task...)
```
