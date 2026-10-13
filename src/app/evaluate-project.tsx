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

export default function EvaluateProjectScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const account: User | null = params.user
    ? JSON.parse(params.user as string)
    : null;
  const project: any = params.project
    ? JSON.parse(params.project as string)
    : null;

  // Calculate progress based on status
  const progress =
    project.status === "Completed"
      ? 100
      : project.status === "Delayed"
        ? 25
        : 50;

  const [overall, setOverall] = useState(0);
  const [relevance, setRelevance] = useState(0);
  const [efficiency, setEfficiency] = useState(0);
  const [effectiveness, setEffectiveness] = useState(0);
  const [impact, setImpact] = useState(0);
  const [sustainability, setSustainability] = useState(0);
  const [comments, setComments] = useState("");
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

  const handleSubmit = async () => {
    if (!account || !project) return;
    if (overall === 0) {
      showToast("Please provide an overall rating.", "error");
      return;
    }

    setLoading(true);
    try {
      const result = await apiCall("submit_evaluation.php", {
        project_id: project.project_id,
        user_id: account.id,
        overall_rating: overall,
        relevance,
        efficiency,
        effectiveness,
        impact,
        sustainability,
        comments,
      });

      if (result.success) {
        showToast("Evaluation submitted successfully!", "success");
        setTimeout(() => router.back(), 1500);
      } else {
        showToast(result.message || "Failed to submit evaluation.", "error");
      }
    } catch (error) {
      showToast("Network error.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Helper to render stars
  const renderStars = (rating: number, setRating: (val: number) => void) => (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => setRating(star)}>
          <Text style={[styles.star, star <= rating && styles.starFilled]}>
            ★
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (!project)
    return (
      <View style={styles.center}>
        <Text>Project not found</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <Toast
        message={toastMessage}
        type={toastType}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />

      {/* Blue Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Evaluate Project</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Project Info Card */}
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.projTitle}>{project.project_name}</Text>
              <Text style={styles.projSub}>📍 {project.location}</Text>
            </View>
            <Text style={styles.completeText}>{progress}% Complete</Text>
          </View>
        </View>

        {/* Overall Rating */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Rate the Project</Text>
          <View style={styles.starsContainer}>
            {renderStars(overall, setOverall)}
            <Text style={styles.ratingText}>
              {overall > 0 ? overall.toFixed(1) : "0.0"}
            </Text>
          </View>
        </View>

        {/* Criteria */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Evaluation Criteria</Text>

          <View style={styles.criteriaRow}>
            <Text style={styles.criteriaLabel}>Relevance</Text>
            {renderStars(relevance, setRelevance)}
          </View>
          <View style={styles.criteriaRow}>
            <Text style={styles.criteriaLabel}>Efficiency</Text>
            {renderStars(efficiency, setEfficiency)}
          </View>
          <View style={styles.criteriaRow}>
            <Text style={styles.criteriaLabel}>Effectiveness</Text>
            {renderStars(effectiveness, setEffectiveness)}
          </View>
          <View style={styles.criteriaRow}>
            <Text style={styles.criteriaLabel}>Impact</Text>
            {renderStars(impact, setImpact)}
          </View>
          <View style={styles.criteriaRow}>
            <Text style={styles.criteriaLabel}>Sustainability</Text>
            {renderStars(sustainability, setSustainability)}
          </View>
        </View>

        {/* Comments */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Additional Comments</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Write your comments here..."
            placeholderTextColor="#999"
            value={comments}
            onChangeText={setComments}
            multiline
            maxLength={500}
          />
          <Text style={styles.charCount}>{comments.length}/500</Text>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Submit Evaluation</Text>
          )}
        </TouchableOpacity>
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
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  projTitle: { fontSize: 18, fontWeight: "bold", color: "#111" },
  projSub: { fontSize: 14, color: "#666", marginTop: 4 },
  completeText: { fontSize: 14, color: "#2563EB", fontWeight: "bold" },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 15,
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  starsRow: { flexDirection: "row", gap: 5 },
  star: { fontSize: 32, color: "#D1D5DB" },
  starFilled: { color: "#2563EB" },
  ratingText: { fontSize: 18, fontWeight: "bold", color: "#10B981" },
  criteriaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  criteriaLabel: { fontSize: 15, color: "#4B5563", width: 120 },
  textArea: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 15,
    height: 120,
    textAlignVertical: "top",
    fontSize: 15,
    backgroundColor: "#FAFAFA",
  },
  charCount: {
    textAlign: "right",
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: "#10B981",
    height: 55,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  disabled: { opacity: 0.6 },
  submitText: { color: "white", fontSize: 18, fontWeight: "bold" },
});
