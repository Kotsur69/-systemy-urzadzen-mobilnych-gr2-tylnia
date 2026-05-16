import { useState } from "react";
import { signIn } from "@/src/services/localAuth";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import SafeAreaContainer from "@/src/components/SafeAreaContainer";
import ViewTitle from "@/src/components/ViewTitle";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetMsg, setResetMsg] = useState("");

  const handleReset = async () => {
    await AsyncStorage.clear();
    setResetMsg("Dane wyczyszczone! Uruchom aplikację ponownie (odśwież stronę).");
    setEmail("");
    setPassword("");
  };

  const handleSignIn = async () => {
    setError(null);
    if (!email.trim()) {
      setError("Podaj adres email.");
      return;
    }
    if (!password) {
      setError("Podaj hasło.");
      return;
    }
    setIsLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace("/");
    } catch (err: any) {
      setError(err.message ?? "Logowanie nie powiodło się.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaContainer style={styles.container}>
      <ViewTitle>Zaloguj się</ViewTitle>

      <TextInput
        style={styles.textInput}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.textInput}
        placeholder="Hasło"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.buttonContainer}>
        <Button
          isLoading={isLoading}
          onPress={handleSignIn}
          text={isLoading ? "Logowanie..." : "Zaloguj się"}
        />
        <Button
          isLoading={isLoading}
          onPress={() => router.push("/auth/register")}
          text="Utwórz konto"
        />
        <Button
          isLoading={isLoading}
          onPress={() => router.push("/(guest)/guest")}
          text="Wejdź jako gość"
        />
      </View>

      <View style={styles.hintBox}>
        <Text style={styles.hintTitle}>Konta testowe:</Text>
        <Text style={styles.hintLine}>student@school.pl / student123</Text>
        <Text style={styles.hintLine}>teacher@school.pl / teacher123</Text>
        <Text style={styles.hintLine}>admin@school.pl / admin123</Text>
      </View>

      <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
        <Text style={styles.resetText}>Resetuj dane demo</Text>
      </TouchableOpacity>
      {resetMsg ? <Text style={styles.resetMsg}>{resetMsg}</Text> : null}
    </SafeAreaContainer>
  );
}

function Button({
  isLoading,
  onPress,
  text,
}: {
  isLoading: boolean;
  onPress: () => void;
  text: string;
}) {
  return (
    <TouchableOpacity
      style={[styles.button, isLoading && styles.buttonDisabled]}
      onPress={onPress}
      disabled={isLoading}
    >
      <Text style={styles.buttonText}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  textInput: {
    height: 50,
    width: "90%",
    backgroundColor: "#FFFFFF",
    borderColor: "#E8EAF6",
    borderWidth: 2,
    borderRadius: 15,
    marginVertical: 10,
    paddingHorizontal: 25,
    fontSize: 16,
    color: "#3C4858",
    shadowColor: "#9E9E9E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  errorText: {
    width: "90%",
    color: "#E53935",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 4,
    marginBottom: 4,
  },
  buttonContainer: {
    width: "90%",
    gap: 12,
    marginTop: 8,
  },
  button: {
    width: "100%",
    backgroundColor: "#5C6BC0",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#5C6BC0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  forgotPasswordContainer: {
    width: "90%",
    alignItems: "flex-end",
    marginTop: 4,
    marginBottom: 16,
  },
  forgotPassword: {
    color: "#5C6BC0",
    fontSize: 14,
    fontWeight: "600",
  },
  hintBox: {
    marginTop: 24,
    width: "90%",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 14,
  },
  hintTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    marginBottom: 4,
  },
  hintLine: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 20,
  },
  resetBtn: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E53935",
  },
  resetText: {
    color: "#E53935",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  resetMsg: {
    marginTop: 8,
    color: "#4CAF50",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "600",
  },
});
