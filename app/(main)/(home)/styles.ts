import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    padding: 20,
    gap: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 4,
    color: "#4f4f4f",
  },
  statusContainer: {
    gap: 8,
  },
  errorText: {
    color: "#b91c1c",
    fontSize: 13,
  },
  emptyText: {
    color: "#505050",
    fontStyle: "italic",
  },
});
