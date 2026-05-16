import SafeAreaContainer from "@/src/components/SafeAreaContainer";
import ViewTitle from "@/src/components/ViewTitle";
import NavigationItem, {
  NavigationItemType,
} from "@/src/components/Navigation/NavigationItem";
import NavigationContainer from "@/src/components/Navigation/NavigationMenu";

export default function Dashboard() {
  return (
    <SafeAreaContainer>
      <ViewTitle>Dashboard</ViewTitle>
      <NavigationContainer>
        {navigationItems.map(
          ({ label, desc, iconName, iconBackgroundColor, route }) => (
            <NavigationItem
              key={label}
              label={label}
              desc={desc}
              iconName={iconName}
              iconBackgroundColor={iconBackgroundColor}
              route={route}
            />
          )
        )}
      </NavigationContainer>
    </SafeAreaContainer>
  );
}

const navigationItems: NavigationItemType[] = [
  {
    label: "Oceny",
    desc: "Przeglądaj swoje oceny",
    iconName: "grade",
    iconBackgroundColor: "#66BB6A",
    route: "/student/grades",
  },
  {
    label: "Zadania domowe",
    desc: "Sprawdzaj i oddawaj zadania",
    iconName: "book",
    iconBackgroundColor: "#29B6F6",
    route: "/student/homework",
  },
  {
    label: "Plan lekcji",
    desc: "Tygodniowy plan zajęć",
    iconName: "calendar-today",
    iconBackgroundColor: "#5C6BC0",
    route: "/student/schedule",
  },
  {
    label: "Powiadomienia",
    desc: "Zadania i nadchodzące wydarzenia",
    iconName: "notifications",
    iconBackgroundColor: "#EF5350",
    route: "/student/notifications",
  },
  {
    label: "Terminarz",
    desc: "Kalendarz wydarzeń szkolnych",
    iconName: "event",
    iconBackgroundColor: "#26A69A",
    route: "/student/events",
  },
  {
    label: "Raport ocen",
    desc: "Podsumowanie i statystyki ocen",
    iconName: "bar-chart",
    iconBackgroundColor: "#FF7043",
    route: "/student/report",
  },
  {
    label: "Wiadomości",
    desc: "Czat z nauczycielami i uczniami",
    iconName: "chat",
    iconBackgroundColor: "#26C6DA",
    route: "/chat",
  },
  {
    label: "Obecności",
    desc: "Monitoruj swoją frekwencję",
    iconName: "check-circle",
    iconBackgroundColor: "#AB47BC",
    route: "/student/presence",
  },
  {
    label: "Profil",
    desc: "Zarządzaj swoim profilem",
    iconName: "person",
    iconBackgroundColor: "#FFA726",
    route: "/student/profile",
  },
];
