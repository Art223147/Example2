import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { User } from "../constants/api";

export default function ProjectDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const account: User | null = params.user
    ? JSON.parse(params.user as string)
    : null;
  const project: any = params.project
    ? JSON.parse(params.project as string)
    : null;

  if (!project || !account) {
    return (
      <View style={styles.center}>
        <Text>Project not found.</Text>
      </View>
    );
  }

  // Simulate progress based on status for the visual demo
  const progress =
    project.status === "Completed"
      ? 100
      : project.status === "Delayed"
        ? 25
        : 50;

  return (
    <View style={styles.container}>
      {/* Blue Header matching Figma */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            router.replace({
              pathname: "/dashboard",
              params: { user: JSON.stringify(account) },
            })
          }
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Project Details</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Placeholder Image (You can replace this with a real image later) */}
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imageText}>📷 Project Image</Text>
        </View>

        {/* Status Badge */}
        <View style={styles.badgeContainer}>
          <Text
            style={[
              styles.badge,
              project.status === "Ongoing"
                ? styles.ongoingBadge
                : project.status === "Completed"
                  ? styles.completedBadge
                  : styles.delayedBadge,
            ]}
          >
            {project.status}
          </Text>
        </View>

        {/* Main Info Card */}
        <View style={styles.card}>
          <Text style={styles.title}>{project.project_name}</Text>
          <Text style={styles.subtitle}>📍 {project.location}</Text>
          <Text style={styles.subtitle}>📅 4 months Deadline</Text>

          <View style={styles.rowItem}>
            <Text style={styles.rowLabel}>📅 Start Date:</Text>
            <Text style={styles.rowValue}>
              {project.start_date || "August 22, 2026"}
            </Text>
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.rowLabel}>🎯 Target Date:</Text>
            <Text style={styles.rowValue}>
              {project.end_date || "November 22, 2026"}
            </Text>
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.rowLabel}>💰 Budget:</Text>
            <Text style={styles.rowValue}>
              ₱{Number(project.budget).toLocaleString()}
            </Text>
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.rowLabel}>👥 Beneficiaries:</Text>
            <Text style={styles.rowValue}>800 residents</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>Progress 📊</Text>
            <Text style={styles.progressLabel}>{progress}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>

          {/* Description */}
          <Text style={styles.descTitle}>Project Description</Text>
          <Text style={styles.descText}>
            {project.description ||
              "The project involves the construction and improvement of community facilities to provide safer and easier access for residents."}
          </Text>
        </View>

        {/* Evaluate Button (Only show if not Admin) */}
        {account.role_name === "User" && (
          <TouchableOpacity
            style={styles.evalButton}
            onPress={() =>
              router.push({
                pathname: "/evaluate-project",
                params: {
                  user: JSON.stringify(account),
                  project: JSON.stringify(project),
                },
              })
            }
          >
            <Text style={styles.evalButtonText}>Evaluate Project</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    backgroundColor: "#2563EB",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backIcon: { color: "white", fontSize: 24, fontWeight: "bold" },
  headerTitle: { color: "white", fontSize: 20, fontWeight: "bold" },
  content: { padding: 20, paddingBottom: 50 },
  imagePlaceholder: {
    height: 180,
    backgroundColor: "#E5E7EB",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  imageText: { color: "#6B7280", fontSize: 16 },
  badgeContainer: { alignItems: "flex-end", marginBottom: 10 },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  ongoingBadge: { backgroundColor: "#2563EB" },
  completedBadge: { backgroundColor: "#10B981" },
  delayedBadge: { backgroundColor: "#F59E0B" },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    elevation: 3,
    marginBottom: 20,
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#111", marginBottom: 5 },
  subtitle: { fontSize: 14, color: "#666", marginBottom: 15 },
  rowItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  rowLabel: { fontSize: 14, color: "#4B5563", fontWeight: "600" },
  rowValue: { fontSize: 14, color: "#111" },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    marginBottom: 5,
  },
  progressLabel: { fontSize: 14, fontWeight: "bold", color: "#374151" },
  progressBarBg: {
    height: 10,
    backgroundColor: "#E5E7EB",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 20,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#2563EB",
    borderRadius: 5,
  },
  descTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 8,
  },
  descText: { fontSize: 14, color: "#4B5563", lineHeight: 20 },
  evalButton: {
    backgroundColor: "#2563EB",
    height: 55,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  evalButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
});
