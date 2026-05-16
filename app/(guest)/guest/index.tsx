import { useEffect } from "react";
import { StyleSheet, ScrollView, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import SafeAreaContainer from "@/src/components/SafeAreaContainer";

const FeatureItem = ({
  icon,
  text,
  delay,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  delay: number;
}) => (
  <Animated.View
    entering={FadeInDown.delay(delay).springify()}
    style={styles.featureItem}
  >
    <Ionicons
      name={icon}
      size={24}
      color="#2f95dc"
      style={styles.featureIcon}
    />
    <Text style={styles.featureText}>{text}</Text>
  </Animated.View>
);

export default function GuestPage() {
  const scale = useSharedValue(0.8);

  useEffect(() => {
    scale.value = withDelay(300, withSpring(1));
  }, []);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <SafeAreaContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
              <Ionicons name="school" size={80} color="#2f95dc" />
            </Animated.View>
            <Animated.Text
              entering={FadeInUp.duration(1000).springify()}
              style={[styles.title]}
            >
              Course Hub
            </Animated.Text>
            <Animated.Text
              entering={FadeInUp.delay(200).duration(1000).springify()}
              style={[styles.subtitle]}
            >
              Zarządzaj swoją edukacją w prosty sposób
            </Animated.Text>
          </View>

          <View style={styles.featuresContainer}>
            <FeatureItem
              icon="calendar-outline"
              text="Planuj zajęcia i zadania"
              delay={400}
            />
            <FeatureItem
              icon="book-outline"
              text="Dostęp do materiałów"
              delay={600}
            />
            <FeatureItem
              icon="chatbubbles-outline"
              text="Kontakt z nauczycielami"
              delay={800}
            />
            <FeatureItem
              icon="stats-chart-outline"
              text="Śledź swoje postępy"
              delay={1000}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    marginTop: 40,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  featuresContainer: {
    marginVertical: 20,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: 12,
  },
  featureIcon: {
    marginRight: 15,
  },
  featureText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
