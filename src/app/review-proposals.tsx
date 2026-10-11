import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { apiCall, User } from "../constants/api";

interface Proposal {
  proposal_id: number;
  project_name: string;
  description: string | null;
  location: string;
  budget: number;
  proposed_by: number;
  full_name: string;
  status: string;
  admin_remarks: string | null;
}

export default function ReviewProposalsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const account: User = JSON.parse(params.user as string);

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProposals = async () => {
    const result = await apiCall("get_proposals.php", {
      user_id: account.id,
      role_id: account.role_id,
    });
    if (result.success) setProposals(result.proposals || []);
    setLoading(false);
  };

  useEffect(() => {
    loadProposals();
  }, []);

  const handleReview = (
    proposal: Proposal,
    status: "Approved" | "Rejected",
  ) => {
    Alert.alert(
      `${status} Proposal`,
      `Are you sure you want to ${status.toLowerCase()} "${proposal.project_name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            const result = await apiCall("review_proposal.php", {
              proposal_id: proposal.proposal_id,
              status,
              admin_remarks: `${status} by Admin`,
              admin_id: account.id,
            });
            if (result.success) {
              Alert.alert("Success", result.message);
              loadProposals();
            } else {
              Alert.alert("Error", result.message);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>← Back to Dashboard</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Review Project Proposals</Text>
        <Text style={styles.subtitle}>Approve or reject staff proposals.</Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#2563EB"
            style={{ marginTop: 40 }}
          />
        ) : proposals.length === 0 ? (
          <Text style={styles.emptyText}>No proposals found.</Text>
        ) : (
          proposals.map((p) => (
            <View key={p.proposal_id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.projName}>{p.project_name}</Text>
                <Text
                  style={[
                    styles.badge,
                    p.status === "Pending"
                      ? styles.badgePending
                      : p.status === "Approved"
                        ? styles.badgeApproved
                        : styles.badgeRejected,
                  ]}
                >
                  {p.status}
                </Text>
              </View>
              <Text style={styles.info}>
                📍 {p.location} • 💰 ₱{Number(p.budget).toLocaleString()}
              </Text>
              <Text style={styles.info}>👤 Proposed by: {p.full_name}</Text>
              {p.description ? (
                <Text style={styles.desc}>{p.description}</Text>
              ) : null}

              {p.status === "Pending" && (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.approveBtn}
                    onPress={() => handleReview(p, "Approved")}
                  >
                    <Text style={styles.btnText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => handleReview(p, "Rejected")}
                  >
                    <Text style={styles.btnText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}

              {p.admin_remarks ? (
                <Text style={styles.remarks}>
                  Admin Remarks: {p.admin_remarks}
                </Text>
              ) : null}
            </View>
          ))
        )}
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
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#666",
    fontSize: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 18,
    marginBottom: 15,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  projName: { fontSize: 18, fontWeight: "bold", color: "#222", flex: 1 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
  },
  badgePending: { backgroundColor: "#F59E0B" },
  badgeApproved: { backgroundColor: "#10B981" },
  badgeRejected: { backgroundColor: "#DC2626" },
  info: { fontSize: 14, color: "#555", marginTop: 4 },
  desc: { fontSize: 14, color: "#444", marginTop: 10, fontStyle: "italic" },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 15 },
  approveBtn: {
    flex: 1,
    backgroundColor: "#10B981",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: "#DC2626",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: { color: "white", fontWeight: "bold", fontSize: 14 },
  remarks: { fontSize: 13, color: "#7C3AED", marginTop: 10, fontWeight: "600" },
});
