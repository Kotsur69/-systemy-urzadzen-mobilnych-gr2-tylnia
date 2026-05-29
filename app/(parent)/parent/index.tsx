import SafeAreaContainer from "@/src/components/SafeAreaContainer";
import ViewTitle from "@/src/components/ViewTitle";
import NavigationItem, {
  NavigationItemType,
} from "@/src/components/Navigation/NavigationItem";
import NavigationContainer from "@/src/components/Navigation/NavigationMenu";

export default function ParentDashboard() {
  return (
    <SafeAreaContainer>
      <ViewTitle>Panel rodzica</ViewTitle>
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
    label: "Oceny dziecka",
    desc: "Podgląd ocen i zadań dziecka",
    iconName: "grade",
    iconBackgroundColor: "#66BB6A",
    route: "/parent/grades",
  },
  {
    label: "Frekwencja dziecka",
    desc: "Obecności i nieobecności",
    iconName: "check-circle",
    iconBackgroundColor: "#AB47BC",
    route: "/parent/presence",
  },
  {
    label: "Profil",
    desc: "Zarządzaj swoim profilem",
    iconName: "person",
    iconBackgroundColor: "#FFA726",
    route: "/parent/profile",
  },
];
