import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "../components/Toast"; // Import Toast
import { apiCall, Project, User } from "../constants/api";

export default function ProjectManagementScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  // Safe parsing
  const account: User | null = params.user
    ? JSON.parse(params.user as string)
    : null;

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectName, setProjectName] = useState("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [status, setStatus] = useState("Ongoing");
  const [loading, setLoading] = useState(false);

  // Toast State
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (message: string, type: "success" | "error") => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const loadProjects = async () => {
    const result = await apiCall("get_projects.php");
    if (result.success && result.projects) {
      setProjects(result.projects);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const addProject = async () => {
    if (!account) {
      showToast("User session not found.", "error");
      return;
    }
    if (!projectName.trim() || !location.trim()) {
      showToast("Project name and location are required.", "error");
      return;
    }
    setLoading(true);
    const result = await apiCall("add_project.php", {
      project_name: projectName.trim(),
      location: location.trim(),
      budget: Number(budget) || 0,
      status,
      created_by: account.id,
    });
    setLoading(false);
    if (result.success) {
      showToast(result.message || "Project added successfully.", "success");
      setProjectName("");
      setLocation("");
      setBudget("");
      setStatus("Ongoing");
      loadProjects();
    } else {
      showToast(result.message || "Failed to add project.", "error");
    }
  };

  const changeStatus = async (projectId: number, currentStatus: string) => {
    if (!account) return;
    // Fixed the string matching (removed extra spaces)
    const next =
      currentStatus === "Ongoing"
        ? "Completed"
        : currentStatus === "Completed"
          ? "Delayed"
          : "Ongoing";

    const result = await apiCall("update_project_status.php", {
      project_id: projectId,
      status: next,
      admin_id: account.id,
    });
    if (result.success) {
      showToast(`Status updated to ${next}`, "success");
      loadProjects();
    } else {
      showToast(result.message || "Failed to update status.", "error");
    }
  };

  const deleteProject = async (projectId: number, name: string) => {
    if (!account) return;
    // Direct delete without Alert popup to satisfy instructor rules
    const result = await apiCall("delete_project.php", {
      project_id: projectId,
      admin_id: account.id,
    });
    if (result.success) {
      showToast(`Project "${name}" deleted.`, "success");
      loadProjects();
    } else {
      showToast(result.message || "Failed to delete project.", "error");
    }
  };

  return (
    <View style={styles.dashboardContainer}>
      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        type={toastType}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />

      <ScrollView contentContainerStyle={styles.dashboardContent}>
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
          <Text style={styles.backButtonText}>← Back to Dashboard</Text>
        </TouchableOpacity>

        <Text style={styles.dashboardTitle}>Project Management</Text>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Add Project</Text>
          <Text style={styles.label}>Project Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter project name"
            placeholderTextColor="#999"
            value={projectName}
            onChangeText={setProjectName}
          />
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter location"
            placeholderTextColor="#999"
            value={location}
            onChangeText={setLocation}
          />
          <Text style={styles.label}>Budget (₱)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter budget"
            placeholderTextColor="#999"
            value={budget}
            onChangeText={setBudget}
            keyboardType="numeric"
          />
          <Text style={styles.label}>Status</Text>
          <View style={styles.roleRow}>
            {["Ongoing", "Completed", "Delayed"].map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.roleButton,
                  status === s && styles.roleButtonSelected,
                ]}
                onPress={() => setStatus(s)}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    status === s && styles.roleButtonTextSelected,
                  ]}
                >
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.signInButton, loading && styles.disabledButton]}
            onPress={addProject}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signInText}>Add Project</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>All Projects</Text>
        {projects.map((p) => (
          <View style={styles.userCard} key={p.project_id}>
            <View style={{ flex: 1 }}>
              <Text style={styles.projectTitle}>{p.project_name}</Text>
              <Text style={styles.projectLocation}>{p.location}</Text>
              <Text style={styles.projectLocation}>
                Budget: ₱{Number(p.budget).toLocaleString()}
              </Text>
              <Text
                style={
                  p.status === "Ongoing"
                    ? styles.ongoing
                    : p.status === "Completed"
                      ? styles.completed
                      : styles.delayed
                }
              >
                {p.status}
              </Text>
            </View>
            <View style={styles.userActions}>
              <TouchableOpacity
                style={styles.smallButton}
                onPress={() => changeStatus(p.project_id, p.status)}
              >
                <Text style={styles.smallButtonText}>Change Status</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteProject(p.project_id, p.project_name)}
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
  ongoing: { color: "#2563EB", fontSize: 15, fontWeight: "bold" },
  completed: { color: "#10B981", fontSize: 15, fontWeight: "bold" },
  delayed: { color: "#F59E0B", fontSize: 15, fontWeight: "bold" },
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
