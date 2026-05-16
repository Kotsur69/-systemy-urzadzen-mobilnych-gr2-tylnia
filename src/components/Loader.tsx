import { ActivityIndicator } from "react-native";

export default function Loader() {
  return (
    <ActivityIndicator
      size="large"
      color="#3e3e3eff"
      style={{ justifyContent: "center", alignItems: "center", flex: 1 }}
    />
  );
}
