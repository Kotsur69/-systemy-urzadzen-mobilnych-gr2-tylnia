import { Platform } from "react-native";

/**
 * Lekki, wieloplatformowy serwis powiadomień.
 *
 * - Web: korzysta z natywnego Web Notifications API przeglądarki
 *   (działa na localhost w trybie `npx expo start` → "w").
 * - Natywnie (Expo Go / urządzenie): bezpieczny no-op, aby nie wymagać
 *   dodatkowych zależności i nigdy nie wywoływać błędu.
 *
 * Wszystkie funkcje są opakowane w try/catch — nigdy nie rzucają wyjątku.
 */

// Pytamy o zgodę najwyżej raz na sesję, aby nie spamować użytkownika.
let permissionRequested = false;

function getNotificationApi(): any | null {
  try {
    if (Platform.OS !== "web") return null;
    const g: any = globalThis as any;
    return g && g.Notification ? g.Notification : null;
  } catch {
    return null;
  }
}

/** Prosi użytkownika o zgodę na powiadomienia (web). Zwraca true, gdy zgoda jest udzielona. */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const N = getNotificationApi();
    if (!N) return false;
    if (N.permission === "granted") return true;
    if (N.permission === "denied") return false;
    if (permissionRequested) return N.permission === "granted";
    permissionRequested = true;
    const result = await N.requestPermission();
    return result === "granted";
  } catch {
    return false;
  }
}

/** Wyświetla pojedyncze powiadomienie systemowe (jeśli zgoda jest udzielona). */
export async function notify(title: string, body: string): Promise<void> {
  try {
    const N = getNotificationApi();
    if (!N || N.permission !== "granted") return;
    // eslint-disable-next-line no-new
    new N(title, { body });
  } catch {
    // Powiadomienia są opcjonalne — cicho ignorujemy ewentualne błędy.
  }
}

/**
 * Buduje i wysyła zbiorcze powiadomienie dla ucznia:
 * liczba zaległych/nieoddanych zadań oraz najbliższe wydarzenie.
 */
export async function notifyStudentSummary(opts: {
  pendingTasks: number;
  nextEventTitle?: string;
  nextEventDays?: number;
}): Promise<void> {
  const granted = await requestNotificationPermission();
  if (!granted) return;

  const parts: string[] = [];
  if (opts.pendingTasks > 0) {
    parts.push(`Masz ${opts.pendingTasks} nieoddane zadanie(a) domowe.`);
  }
  if (opts.nextEventTitle && opts.nextEventDays !== undefined) {
    const when =
      opts.nextEventDays <= 0 ? "dziś" : `za ${opts.nextEventDays} dni`;
    parts.push(`Najbliższe wydarzenie: ${opts.nextEventTitle} (${when}).`);
  }

  if (parts.length === 0) return;
  await notify("Szkolna aplikacja — powiadomienia", parts.join(" "));
}
