import { FontAwesome } from "@expo/vector-icons";

type TabBarIconProps = {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
};

export function TabBarIcon(props: TabBarIconProps) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}
