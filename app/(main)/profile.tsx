import { useUser } from "@clerk/clerk-expo";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SignOutButton } from "../components/sign-out-button";

export default function ProfilePage() {
  const { user } = useUser();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
      <View style={styles.container}>
        <Text style={styles.title}>Profil</Text>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>
          {user?.emailAddresses[0]?.emailAddress ?? "Non disponible"}
        </Text>
        <SignOutButton />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f2f4f7",
  },
  container: {
    padding: 20,
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  label: {
    color: "#6b7280",
    fontSize: 13,
  },
  value: {
    color: "#111827",
    fontSize: 16,
  },
});
