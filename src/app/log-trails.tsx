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
import { apiCall, LogEntry, User } from "../constants/api";

export default function LogTrailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const account: User = JSON.parse(params.user as string);

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const result = await apiCall("get_logs.php", { admin_id: account.id });
      if (result.success && result.logs) {
        setLogs(result.logs);
      } else {
        Alert.alert("Error", result.message || "Failed to load logs.");
      }
      setLoading(false);
    })();
  }, []);

  return (
    <View style={styles.dashboardContainer}>
      <ScrollView contentContainerStyle={styles.dashboardContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back to Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.dashboardTitle}>System Log Trail</Text>
        <Text style={styles.subtitle}>
          All user activities are recorded here.
        </Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#2563EB"
            style={{ marginTop: 40 }}
          />
        ) : logs.length === 0 ? (
          <Text
            style={{
              textAlign: "center",
              marginTop: 40,
              color: "#666",
              fontSize: 16,
            }}
          >
            No activity logs yet.
          </Text>
        ) : (
          logs.map((log) => (
            <View style={styles.logCard} key={log.log_id}>
              <View style={styles.logHeader}>
                <Text style={styles.logAction}>{log.action}</Text>
                <Text style={styles.logDate}>
                  {new Date(log.created_at).toLocaleString()}
                </Text>
              </View>
              <Text style={styles.logUser}>
                User: {log.full_name || "System"} (@{log.username || "unknown"})
              </Text>
              <Text style={styles.logDetails}>{log.details}</Text>
              <Text style={styles.logIp}>IP Address: {log.ip_address}</Text>
            </View>
          ))
        )}
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
    marginBottom: 10,
  },
  subtitle: { fontSize: 17, color: "#666", marginTop: 5, marginBottom: 20 },
  logCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  logAction: { fontSize: 16, fontWeight: "bold", color: "#2563EB" },
  logDate: { fontSize: 13, color: "#888" },
  logUser: { fontSize: 15, fontWeight: "600", color: "#333" },
  logDetails: { fontSize: 14, color: "#555", marginTop: 4 },
  logIp: { fontSize: 12, color: "#999", marginTop: 8, fontStyle: "italic" },
});
