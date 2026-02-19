import { useUser } from "@clerk/clerk-expo";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SignOutButton } from "../components/sign-out-button";
import { palette, radius } from "../theme";

export default function ProfilePage() {
  const { user } = useUser();

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right", "bottom"]}
    >
      <View style={styles.container}>
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>ME</Text>
          </View>

          <Text style={styles.title}>Profil</Text>
          <Text style={styles.label}>Compte connecté</Text>
          <Text style={styles.value}>
            {user?.emailAddresses[0]?.emailAddress ?? "Non disponible"}
          </Text>

          <SignOutButton />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  profileCard: {
    backgroundColor: palette.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 16,
    gap: 6,
  },
  avatarWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: palette.backgroundMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  avatarText: {
    color: palette.primary,
    fontWeight: "800",
    fontSize: 13,
  },
  title: {
    color: palette.text,
    fontSize: 28,
    fontWeight: "800",
  },
  label: {
    color: palette.textMuted,
    fontSize: 13,
  },
  value: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "600",
  },
  tipCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surfaceSoft,
    padding: 12,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  tipBadge: {
    color: palette.primary,
    fontWeight: "800",
    fontSize: 11,
  },
  tipText: {
    flex: 1,
    color: palette.textMuted,
    fontSize: 13,
  },
});
