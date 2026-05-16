import { useState } from "react";
import { register as localRegister } from "@/src/services/localAuth";
import { router } from "expo-router";
import {
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { TabBarIcon } from "@/src/components/TabBarIcon";
import ViewTitle from "@/src/components/ViewTitle";
import SafeAreaContainer from "@/src/components/SafeAreaContainer";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    setError(null);

    if (!email.trim()) {
      setError("Podaj adres email.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Podaj poprawny adres email.");
      return;
    }
    if (!password) {
      setError("Podaj hasło.");
      return;
    }
    if (password.length < 6) {
      setError("Hasło musi mieć co najmniej 6 znaków.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Hasła nie są takie same.");
      return;
    }

    setIsLoading(true);
    try {
      await localRegister(email.trim(), password);
      router.replace("/");
    } catch (err: any) {
      setError(err.message ?? "Rejestracja nie powiodła się.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaContainer style={styles.container}>
      <TouchableOpacity style={styles.arrow} onPress={() => router.back()}>
        <TabBarIcon name="arrow-left" color="#1A237E" />
      </TouchableOpacity>

      <ViewTitle>Zarejestruj się</ViewTitle>

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
      <TextInput
        style={styles.textInput}
        placeholder="Powtórz hasło"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "Tworzenie konta..." : "Utwórz konto"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  arrow: {
    position: "absolute",
    left: 30,
    top: 50,
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
    marginTop: 16,
  },
  button: {
    width: "100%",
    backgroundColor: "#5C6BC0",
    padding: 20,
    borderRadius: 15,
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
    fontSize: 18,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
