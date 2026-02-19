import { useClerk } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import { palette, radius } from "../theme";

export const SignOutButton = () => {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/(auth)/sign-in");
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      onPress={handleSignOut}
    >
      <Text style={styles.buttonText}>Se déconnecter</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: palette.danger,
    height: 46,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    flexDirection: "row",
    marginTop: 8,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 14,
  },
});
