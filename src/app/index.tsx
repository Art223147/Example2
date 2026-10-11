import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { apiCall } from "../constants/api";

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const enteredUsername = username.trim();
    const enteredPassword = password;

    if (!enteredUsername && !enteredPassword) {
      Alert.alert("Login Required", "Please enter your username and password.");
      return;
    }
    if (!enteredUsername) {
      Alert.alert("Username Required", "Please enter your username.");
      return;
    }
    if (!enteredPassword) {
      Alert.alert("Password Required", "Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const result = await apiCall("login.php", {
        username: enteredUsername,
        password: enteredPassword,
      });

      if (result.success && result.user) {
        Alert.alert("Login Successful", `Welcome, ${result.user.full_name}!`, [
          {
            text: "CONTINUE",
            onPress: () => {
              // Store user in navigation params or global state
              router.replace({
                pathname: "/dashboard",
                params: { user: JSON.stringify(result.user) },
              });
            },
          },
        ]);
      } else {
        Alert.alert("Login Failed", result.message || "Invalid credentials.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Network Error",
        "Cannot connect to server. Check your IP address and XAMPP.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.loginContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoCircle}>
          <Text style={styles.logoInitials}>TT</Text>
        </View>
        <Text style={styles.appName}>TrackTogether</Text>
        <Text style={styles.tagline}>Together for Better Communities</Text>

        <View style={styles.loginBox}>
          <Text style={styles.loginTitle}>Login</Text>
          <Text style={styles.barangay}>Barangay Alta Vista</Text>

          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter username"
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            editable={!loading}
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              editable={!loading}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.showPassword}>
                {showPassword ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.signInButton, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signInText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.demoBox}>
            <Text style={styles.demoTitle}>Demo Accounts</Text>
            <Text style={styles.demoRole}>Admin</Text>
            <Text style={styles.demoText}>
              Username: admin{"\n"}Password: Admin123!
            </Text>
            <Text style={styles.demoRole}>Staff</Text>
            <Text style={styles.demoText}>
              Username: staff{"\n"}Password: Staff123!
            </Text>
            <Text style={styles.demoRole}>User</Text>
            <Text style={styles.demoText}>
              Username: user{"\n"}Password: User123!
            </Text>
          </View>
        </View>

        <Text style={styles.footer}></Text>
        <Text style={styles.footer}></Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  loginContent: {
    padding: 30,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: "center",
  },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  logoInitials: { color: "white", fontSize: 48, fontWeight: "bold" },
  appName: { fontSize: 40, fontWeight: "bold", color: "#2563EB" },
  tagline: {
    fontSize: 20,
    color: "#666",
    marginTop: 8,
    marginBottom: 40,
    textAlign: "center",
  },
  loginBox: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 25,
    padding: 30,
    elevation: 5,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  loginTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#111",
    textAlign: "center",
  },
  barangay: {
    fontSize: 22,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 35,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
    marginBottom: 10,
    marginTop: 20,
  },
  input: {
    width: "100%",
    height: 60,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 15,
    paddingHorizontal: 18,
    fontSize: 18,
    backgroundColor: "#FAFAFA",
  },
  passwordContainer: {
    height: 60,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 15,
    backgroundColor: "#FAFAFA",
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 18,
    fontSize: 18,
  },
  showPassword: {
    color: "#2563EB",
    fontSize: 16,
    fontWeight: "bold",
    paddingRight: 18,
  },
  signInButton: {
    height: 60,
    backgroundColor: "#2563EB",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
  },
  disabledButton: { opacity: 0.6 },
  signInText: { color: "white", fontSize: 20, fontWeight: "bold" },
  demoBox: {
    backgroundColor: "#EEF6FF",
    borderRadius: 15,
    padding: 20,
    marginTop: 25,
  },
  demoTitle: {
    color: "#2563EB",
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 12,
  },
  demoRole: { color: "#222", fontSize: 17, fontWeight: "bold", marginTop: 8 },
  demoText: { color: "#555", fontSize: 16, marginTop: 3, lineHeight: 22 },
  footer: { color: "#888", fontSize: 16, textAlign: "center", marginTop: 25 },
});
