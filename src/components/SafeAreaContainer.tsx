import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/src/context/ThemeContext";

export default function SafeAreaContainer({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: object;
}) {
  const { C } = useAppTheme();
  return (
    <SafeAreaView
      style={[{ paddingTop: 12, flex: 1, backgroundColor: C.bg }, style]}
    >
      {children}
    </SafeAreaView>
  );
}
