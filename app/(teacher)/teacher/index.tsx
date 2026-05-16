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
    label: "Lista zadań",
    desc: "Przeglądaj i oceniaj zadania",
    iconName: "task",
    iconBackgroundColor: "#42A5F5",
    route: "/teacher/tasks",
  },
  {
    label: "Statystyki",
    desc: "Wyniki i oceny uczniów",
    iconName: "bar-chart",
    iconBackgroundColor: "#66BB6A",
    route: "/teacher/statistics",
  },
  {
    label: "Terminarz",
    desc: "Dodawaj wydarzenia widoczne dla uczniów",
    iconName: "event",
    iconBackgroundColor: "#26A69A",
    route: "/teacher/events",
  },
  {
    label: "Wiadomości",
    desc: "Czat z uczniami i nauczycielami",
    iconName: "chat",
    iconBackgroundColor: "#26C6DA",
    route: "/chat",
  },
  {
    label: "Profil",
    desc: "Zarządzaj swoim profilem",
    iconName: "person",
    iconBackgroundColor: "#FFA726",
    route: "/teacher/profile",
  },
];
