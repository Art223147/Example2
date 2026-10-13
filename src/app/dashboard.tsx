import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { apiCall, Project, User } from "../constants/api";

export default function DashboardScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // ✅ FIX: Safe parsing to prevent crashes
  const account: User | null = params.user
    ? JSON.parse(params.user as string)
    : null;

  const [projects, setProjects] = useState<Project[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const loadData = async () => {
    if (!account) return;
    try {
      const projResult = await apiCall("get_projects.php");
      if (projResult.success && projResult.projects) {
        setProjects(projResult.projects);
      }

      if (account.role_name === "Admin") {
        const userResult = await apiCall("get_users.php");
        if (userResult.success && userResult.users) {
          setTotalUsers(userResult.users.length);
        }
      }
    } catch (error) {
      console.error("Load error", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [account]),
  );

  // ✅ FIX: Direct logout function (No Alert.alert)
  const handleLogout = async () => {
    if (!account) return;
    try {
      await apiCall("logout.php", { user_id: account.id });
    } catch (e) {
      console.log("Logout log failed", e);
    }
    router.replace("/");
  };

  if (loading || !account) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  const ongoing = projects.filter((p) => p.status === "Ongoing").length;
  const completed = projects.filter((p) => p.status === "Completed").length;
  const delayed = projects.filter((p) => p.status === "Delayed").length;

  return (
    <View style={styles.dashboardContainer}>
      <ScrollView contentContainerStyle={styles.dashboardContent}>
        <Text style={styles.logoText}>TrackTogether</Text>
        <Text style={styles.subtitle}>
          Community Project Tracking and Evaluation
        </Text>
        <Text style={styles.welcomeText}>Welcome, {account.full_name}</Text>
        <Text style={styles.roleBadge}>{account.role_name.toUpperCase()}</Text>
        <Text style={styles.dashboardTitle}>
          {account.role_name === "Admin" ? "Admin" : "User"} Dashboard
        </Text>

        {account.role_name === "Admin" ? (
          <>
            <View style={styles.row}>
              <View style={styles.card}>
                <Text style={styles.number}>{projects.length}</Text>
                <Text style={styles.cardText}>Total Projects</Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.number}>{ongoing}</Text>
                <Text style={styles.cardText}>Ongoing</Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.card}>
                <Text style={styles.number}>{completed}</Text>
                <Text style={styles.cardText}>Completed</Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.number}>{delayed}</Text>
                <Text style={styles.cardText}>Delayed</Text>
              </View>
            </View>
            <View style={styles.singleCard}>
              <Text style={styles.number}>{totalUsers}</Text>
              <Text style={styles.cardText}>Registered Users</Text>
            </View>
            <Text style={styles.sectionTitle}>Recent Projects</Text>
            {projects.slice(0, 5).map((p) => (
              <TouchableOpacity
                style={styles.projectCard}
                key={p.project_id}
                onPress={() =>
                  router.push({
                    pathname: "/project-details",
                    params: {
                      user: JSON.stringify(account),
                      project: JSON.stringify(p),
                    },
                  })
                }
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.projectTitle}>{p.project_name}</Text>
                  <Text style={styles.projectLocation}>{p.location}</Text>
                </View>
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
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.manageButton}
              onPress={() =>
                router.push({
                  pathname: "/project-management",
                  params: { user: JSON.stringify(account) },
                })
              }
            >
              <Text style={styles.manageButtonText}>
                Manage Community Projects
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.userButton}
              onPress={() =>
                router.push({
                  pathname: "/user-management",
                  params: { user: JSON.stringify(account) },
                })
              }
            >
              <Text style={styles.manageButtonText}>User Management</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.userButton, { backgroundColor: "#7C3AED" }]}
              onPress={() =>
                router.push({
                  pathname: "/log-trails",
                  params: { user: JSON.stringify(account) },
                })
              }
            >
              <Text style={styles.manageButtonText}>View Log Trails</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.userButton, { backgroundColor: "#F59E0B" }]}
              onPress={() =>
                router.push({
                  pathname: "/review-proposals",
                  params: { user: JSON.stringify(account) },
                })
              }
            >
              <Text style={styles.manageButtonText}>
                Review Project Proposals
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.singleCard}>
              <Text style={styles.number}>{projects.length}</Text>
              <Text style={styles.cardText}>Available Projects</Text>
            </View>
            <Text style={styles.sectionTitle}>Community Projects</Text>
            {projects.map((p) => (
              <TouchableOpacity
                key={p.project_id}
                style={styles.projectCardVertical}
                onPress={() =>
                  router.push({
                    pathname: "/project-details",
                    params: {
                      user: JSON.stringify(account),
                      project: JSON.stringify(p), // Pass the whole project object!
                    },
                  })
                }
              >
                <Text style={styles.projectTitle}>{p.project_name}</Text>
                <Text style={styles.projectLocation}>
                  Location: {p.location}
                </Text>
                {p.description ? (
                  <Text style={styles.projectDescription}>{p.description}</Text>
                ) : null}
                <View style={styles.projectBottomRow}>
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
                  <Text style={styles.projectLocation}>
                    ₱{Number(p.budget).toLocaleString()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.userButton, { backgroundColor: "#10B981" }]}
              onPress={() =>
                router.push({
                  pathname: "/submit-proposal",
                  params: { user: JSON.stringify(account) },
                })
              }
            >
              <Text style={styles.manageButtonText}>
                Submit Project Proposal
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* ✅ FIX: In-app Logout Confirmation (No Alert.alert) */}
        {showLogoutConfirm ? (
          <View style={styles.logoutConfirmContainer}>
            <Text style={styles.logoutConfirmText}>
              Are you sure you want to sign out?
            </Text>
            <View style={styles.logoutConfirmButtons}>
              <TouchableOpacity
                style={styles.confirmYesBtn}
                onPress={handleLogout}
              >
                <Text style={styles.confirmYesText}>Yes, Sign Out</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmNoBtn}
                onPress={() => setShowLogoutConfirm(false)}
              >
                <Text style={styles.confirmNoText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => setShowLogoutConfirm(true)}
          >
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  dashboardContainer: { flex: 1, backgroundColor: "#F5F7FA" },
  dashboardContent: { padding: 25, paddingTop: 55, paddingBottom: 50 },
  logoText: { fontSize: 35, fontWeight: "bold", color: "#2563EB" },
  subtitle: { fontSize: 17, color: "#666", marginTop: 5 },
  welcomeText: {
    fontSize: 18,
    color: "#444",
    marginTop: 22,
    fontWeight: "600",
  },
  roleBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#DBEAFE",
    color: "#2563EB",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    fontWeight: "bold",
    fontSize: 13,
    marginTop: 8,
  },
  dashboardTitle: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#111",
    marginTop: 35,
    marginBottom: 22,
  },
  row: { flexDirection: "row", gap: 15, marginBottom: 15 },
  card: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 22,
    elevation: 3,
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  singleCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 22,
    elevation: 3,
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    marginBottom: 5,
  },
  number: { fontSize: 36, fontWeight: "bold", color: "#2563EB" },
  cardText: { fontSize: 16, color: "#666", marginTop: 5 },
  sectionTitle: {
    fontSize: 25,
    fontWeight: "bold",
    marginTop: 30,
    marginBottom: 18,
    color: "#111",
  },
  projectCard: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 20,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  projectCardVertical: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  projectTitle: { fontSize: 18, fontWeight: "bold", color: "#222" },
  projectLocation: { fontSize: 15, color: "#777", marginTop: 6 },
  projectDescription: {
    fontSize: 15,
    color: "#555",
    marginTop: 10,
    lineHeight: 21,
  },
  projectBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },
  ongoing: { color: "#2563EB", fontSize: 15, fontWeight: "bold" },
  completed: { color: "#10B981", fontSize: 15, fontWeight: "bold" },
  delayed: { color: "#F59E0B", fontSize: 15, fontWeight: "bold" },
  manageButton: {
    backgroundColor: "#10B981",
    height: 60,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  userButton: {
    backgroundColor: "#2563EB",
    height: 60,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },
  manageButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
  logoutButton: {
    height: 60,
    borderWidth: 2,
    borderColor: "#DC2626",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
    backgroundColor: "white",
  },
  logoutText: { color: "#DC2626", fontSize: 19, fontWeight: "bold" },
  // New styles for inline logout confirmation
  logoutConfirmContainer: {
    backgroundColor: "#FEF2F2",
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#FECACA",
    alignItems: "center",
  },
  logoutConfirmText: {
    color: "#991B1B",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  logoutConfirmButtons: { flexDirection: "row", gap: 15 },
  confirmYesBtn: {
    backgroundColor: "#DC2626",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  confirmYesText: { color: "white", fontWeight: "bold", fontSize: 14 },
  confirmNoBtn: {
    backgroundColor: "#E5E7EB",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  confirmNoText: { color: "#4B5563", fontWeight: "bold", fontSize: 14 },
});
