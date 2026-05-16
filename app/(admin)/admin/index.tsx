import SafeAreaContainer from "@/src/components/SafeAreaContainer";
import ViewTitle from "@/src/components/ViewTitle";
import NavigationItem, {
  NavigationItemType,
} from "@/src/components/Navigation/NavigationItem";
import NavigationContainer from "@/src/components/Navigation/NavigationMenu";

const AdminPanel = () => {
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
};

export default AdminPanel;

const navigationItems: NavigationItemType[] = [
  {
    label: "Zarządzanie Użytkownikami",
    desc: "Edytuj role, statusy i dane kont",
    iconName: "people",
    iconBackgroundColor: "#5C6BC0",
    route: "/admin/users",
  },
  {
    label: "Przedmioty Lekcyjne",
    desc: "Dodawaj i edytuj przedmioty",
    iconName: "class",
    iconBackgroundColor: "#FFA726",
    route: "/admin/subjects",
  },
];
