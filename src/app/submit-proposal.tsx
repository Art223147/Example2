import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "../components/Toast";
import { apiCall, User } from "../constants/api";

export default function SubmitProposalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // ✅ FIX: Safely parse the user object (prevents the TypeScript error)
  const account: User | null = params.user
    ? JSON.parse(params.user as string)
    : null;

  const [projectName, setProjectName] = useState("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (message: string, type: "success" | "error") => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const handleSubmit = async () => {
    if (!account) {
      showToast("User session not found. Please log in again.", "error");
      return;
    }

    if (!projectName.trim() || !location.trim()) {
      showToast("Project name and location are required.", "error");
      return;
    }

    setLoading(true);
    try {
      const result = await apiCall("submit_proposal.php", {
        project_name: projectName.trim(),
        description: description.trim(),
        location: location.trim(),
        budget: Number(budget) || 0,
        proposed_by: account.id,
      });

      if (result.success) {
        showToast(
          result.message || "Proposal submitted successfully!",
          "success",
        );
        setProjectName("");
        setLocation("");
        setBudget("");
        setDescription("");
        setTimeout(() => router.back(), 2000);
      } else {
        showToast(result.message || "An error occurred.", "error");
      }
    } catch (error) {
      showToast("Network error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Toast notification */}
      <Toast
        message={toastMessage}
        type={toastType}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (account) {
              router.replace({
                pathname: "/dashboard",
                params: { user: JSON.stringify(account) },
              });
            } else {
              router.replace("/");
            }
          }}
        >
          <Text style={styles.backText}>← Back to Dashboard</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Submit Project Proposal</Text>
        <Text style={styles.subtitle}>
          Your proposal will be reviewed by the Admin.
        </Text>

        <View style={styles.formCard}>
          <Text style={styles.label}>Project Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Streetlight Installation"
            value={projectName}
            onChangeText={setProjectName}
          />

          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Purok 2, Alta Vista"
            value={location}
            onChangeText={setLocation}
          />

          <Text style={styles.label}>Estimated Budget (₱)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 50000"
            value={budget}
            onChangeText={setBudget}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Description / Purpose</Text>
          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: "top" }]}
            placeholder="Describe the project..."
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>Submit Proposal</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  content: { padding: 25, paddingTop: 55, paddingBottom: 50 },
  backButton: { marginBottom: 20 },
  backText: { color: "#2563EB", fontSize: 17, fontWeight: "bold" },
  title: { fontSize: 28, fontWeight: "bold", color: "#111", marginBottom: 5 },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 25 },
  formCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 22,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    width: "100%",
    height: 55,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
  },
  submitButton: {
    height: 55,
    backgroundColor: "#10B981",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
  },
  disabled: { opacity: 0.6 },
  submitText: { color: "white", fontSize: 18, fontWeight: "bold" },
});
