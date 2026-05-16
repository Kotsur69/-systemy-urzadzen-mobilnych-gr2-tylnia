import React, { useState } from "react";
import {
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  View,
} from "react-native";
import { router } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";

import { sendUserPasswordReset } from "@/src/services/userApi";
import SafeAreaContainer from "@/src/components/SafeAreaContainer";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleResetPassword = async () => {
    setError(null);

    if (!email) {
      setError("Proszę wprowadzić adres e-mail.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Proszę wprowadzić poprawny adres e-mail.");
      return;
    }

    try {
      setLoading(true);
      await sendUserPasswordReset(email);
      setEmailSent(true);
    } catch {
      // nie ujawniamy czy email istnieje
      setEmailSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaContainer style={styles.container}>
      {!emailSent ? (
        <>
          <Text style={styles.title}>Zapomniałeś hasła?</Text>

          <Text style={styles.subtitle}>
            Wprowadź swój adres e-mail, a wyślemy Ci link do zresetowania hasła.
          </Text>

          <TextInput
            style={styles.textInput}
            placeholder="email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={styles.button}
            onPress={handleResetPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Zresetuj hasło</Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <FontAwesome
            name="paper-plane"
            size={64}
            color="#5C6BC0"
            style={{ marginBottom: 20 }}
          />

          <Text style={styles.successTitle}>Sprawdź swoją skrzynkę</Text>

          <View style={styles.successBox}>
            <Text style={styles.successText}>
              Jeśli konto z tym adresem e-mail istnieje, wysłaliśmy Ci link do
              zresetowania hasła.
            </Text>
            <Text style={styles.successSubText}>
              Nie zapomnij sprawdzić folderu spam!
            </Text>
          </View>
        </>
      )}

      <TouchableOpacity
        style={styles.backContainer}
        onPress={() => router.replace("/")}
      >
        <Text style={styles.backText}>← Powrót do logowania</Text>
      </TouchableOpacity>
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 15,
    color: "#1A237E",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: "#3C4858",
  },
  textInput: {
    height: 50,
    width: "90%",
    backgroundColor: "#FFFFFF",
    borderColor: "#E8EAF6",
    borderWidth: 2,
    borderRadius: 15,
    marginVertical: 15,
    paddingHorizontal: 25,
    fontSize: 16,
    color: "#3C4858",
    shadowColor: "#9E9E9E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  button: {
    width: "90%",
    marginVertical: 15,
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
  errorText: {
    width: "90%",
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A237E",
    marginBottom: 10,
  },
  successBox: {
    width: "90%",
    backgroundColor: "#FFFFFF",
    borderColor: "#E8EAF6",
    borderWidth: 2,
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    shadowColor: "#9E9E9E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  successText: {
    textAlign: "center",
    fontSize: 14,
    lineHeight: 22,
  },
  successSubText: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: "#5C6BC0",
  },
  backContainer: {
    marginTop: 10,
  },
  backText: {
    color: "#5C6BC0",
    fontSize: 16,
    fontWeight: "600",
  },
});
