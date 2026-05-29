import { UserRole } from "./UserRole";

export default interface UserData {
  firstName: string;
  surname: string;
  role: UserRole;
  email: string;
  uid: string;
  active: boolean;
  specialty?: string; // nauczyciel: "Matematyka", "Informatyka", itp.
  childIds?: string[]; // rodzic: lista uid dzieci (uczniów), które obserwuje
}
