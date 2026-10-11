import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { apiCall, User } from "../constants/api";

export default function UserManagementScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const account: User = JSON.parse(params.user as string);

  const [users, setUsers] = useState<User[]>([]);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("User");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    const result = await apiCall("get_users.php");
    if (result.success && result.users) {
      setUsers(result.users);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const addUser = async () => {
    if (!fullName.trim() || !username.trim() || !password || !confirmPassword) {
      Alert.alert("Required Fields", "Please complete all user fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "Password Mismatch",
        "Password and Confirm Password do not match.",
      );
      return;
    }

    setLoading(true);
    const roleId = role === "Admin" ? 1 : role === "Staff" ? 2 : 3;
    const result = await apiCall("register.php", {
      full_name: fullName.trim(),
      username: username.trim(),
      password,
      confirm_password: confirmPassword,
      role_id: roleId,
      admin_id: account.id,
    });
    setLoading(false);

    if (result.success) {
      Alert.alert("Success", result.message || "User created successfully.");
      setFullName("");
      setUsername("");
      setPassword("");
      setConfirmPassword("");
      setRole("User");
      loadUsers();
    } else {
      Alert.alert("Error", result.message || "Failed to create user.");
    }
  };

  const toggleStatus = async (userId: number, currentStatus: string) => {
    if (userId === account.id) {
      Alert.alert("Not Allowed", "You cannot deactivate your own account.");
      return;
    }
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    const result = await apiCall("toggle_user_status.php", {
      user_id: userId,
      status: newStatus,
      admin_id: account.id,
    });
    if (result.success) {
      loadUsers();
    } else {
      Alert.alert("Error", result.message || "Failed to update status.");
    }
  };

  const deleteUser = (userId: number, uname: string) => {
    if (userId === account.id) {
      Alert.alert("Not Allowed", "You cannot delete your own account.");
      return;
    }
    Alert.alert("Delete User", `Delete "${uname}"? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const result = await apiCall("delete_user.php", {
            user_id: userId,
            admin_id: account.id,
          });
          if (result.success) {
            loadUsers();
          } else {
            Alert.alert("Error", result.message || "Failed to delete user.");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.dashboardContainer}>
      <ScrollView contentContainerStyle={styles.dashboardContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back to Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.dashboardTitle}>User Management</Text>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Add New User</Text>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter full name"
            placeholderTextColor="#999"
            value={fullName}
            onChangeText={setFullName}
          />
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter username"
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)}>
              <Text style={styles.showPassword}>
                {showPass ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm password"
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPass}
            autoCapitalize="none"
          />
          <Text style={styles.label}>Role</Text>
          <View style={styles.roleRow}>
            {["Admin", "Staff", "User"].map((r) => (
              <TouchableOpacity
                key={r}
                style={[
                  styles.roleButton,
                  role === r && styles.roleButtonSelected,
                ]}
                onPress={() => setRole(r)}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    role === r && styles.roleButtonTextSelected,
                  ]}
                >
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.passwordHint}>
            Password: 8+ chars, uppercase, lowercase, number, special character.
          </Text>
          <TouchableOpacity
            style={[styles.signInButton, loading && styles.disabledButton]}
            onPress={addUser}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signInText}>Add User</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Registered Users</Text>
        {users.map((u) => (
          <View style={styles.userCard} key={u.id}>
            <View style={{ flex: 1 }}>
              <Text style={styles.projectTitle}>{u.full_name}</Text>
              <Text style={styles.projectLocation}>
                @{u.username} • {u.role_name}
              </Text>
              <Text
                style={
                  u.status === "Active"
                    ? styles.activeText
                    : styles.inactiveText
                }
              >
                {u.status}
              </Text>
            </View>
            <View style={styles.userActions}>
              <TouchableOpacity
                style={styles.smallButton}
                onPress={() => toggleStatus(u.id, u.status)}
              >
                <Text style={styles.smallButtonText}>
                  {u.status === "Active" ? "Deactivate" : "Activate"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteUser(u.id, u.username)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  dashboardContainer: { flex: 1, backgroundColor: "#F5F7FA" },
  dashboardContent: { padding: 25, paddingTop: 55, paddingBottom: 50 },
  backButton: { marginBottom: 20 },
  backButtonText: { color: "#2563EB", fontSize: 17, fontWeight: "bold" },
  dashboardTitle: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#111",
    marginTop: 10,
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 25,
    fontWeight: "bold",
    marginTop: 30,
    marginBottom: 18,
    color: "#111",
  },
  formCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 22,
    elevation: 3,
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
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
  roleRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 5 },
  roleButton: {
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#FAFAFA",
  },
  roleButtonSelected: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  roleButtonText: { color: "#444", fontWeight: "600" },
  roleButtonTextSelected: { color: "white" },
  passwordHint: {
    color: "#777",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 15,
    textAlign: "center",
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
  userCard: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 18,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  projectTitle: { fontSize: 18, fontWeight: "bold", color: "#222" },
  projectLocation: { fontSize: 15, color: "#777", marginTop: 6 },
  activeText: {
    color: "#10B981",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 5,
  },
  inactiveText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 5,
  },
  userActions: { marginLeft: 10, alignItems: "flex-end", gap: 8 },
  smallButton: {
    backgroundColor: "#2563EB",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  smallButtonText: { color: "white", fontSize: 12, fontWeight: "bold" },
  deleteButton: {
    backgroundColor: "#DC2626",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  deleteButtonText: { color: "white", fontSize: 12, fontWeight: "bold" },
});
