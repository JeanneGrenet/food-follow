import { useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import * as React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { palette, radius } from "../theme";
import { Ionicons } from "@expo/vector-icons";

export default function Page() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    try {
      await signUp.create({
        emailAddress,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === "complete") {
        await setActive({
          session: signUpAttempt.createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              console.log(session?.currentTask);
              return;
            }

            router.replace("/");
          },
        });
      } else {
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  if (pendingVerification) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={["top", "left", "right", "bottom"]}
      >
        <View style={styles.container}>
          <View style={styles.brandTop}>
            <View style={styles.brandIcon}>
              <Text style={styles.brandIconText}>MAIL</Text>
            </View>
            <Text style={styles.brandTitle}>Confirme ton email</Text>
            <Text style={styles.brandSubtitle}>
              Entre le code envoyé pour terminer l'inscription.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Code de vérification</Text>
            <TextInput
              style={styles.input}
              value={code}
              placeholder="Entrer le code"
              placeholderTextColor={palette.textMuted}
              onChangeText={(nextCode) => setCode(nextCode)}
              keyboardType="numeric"
            />
            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
              onPress={onVerifyPress}
            >
              <Text style={styles.buttonText}>Valider</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right", "bottom"]}
    >
      <View style={styles.container}>
        <View style={styles.brandTop}>
          <View style={styles.brandIcon}>
            <Ionicons name="leaf" size={22} color={palette.primary} />
          </View>
          <Text style={styles.brandTitle}>Créer un compte</Text>
          <Text style={styles.brandSubtitle}>
            Commence ton suivi bien-être en quelques secondes.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            value={emailAddress}
            placeholder="email@exemple.com"
            placeholderTextColor={palette.textMuted}
            onChangeText={(email) => setEmailAddress(email)}
            keyboardType="email-address"
          />
          <Text style={styles.label}>Mot de passe</Text>
          <TextInput
            style={styles.input}
            value={password}
            placeholder="••••••••"
            placeholderTextColor={palette.textMuted}
            secureTextEntry
            onChangeText={(nextPassword) => setPassword(nextPassword)}
          />
          <Pressable
            style={({ pressed }) => [
              styles.button,
              (!emailAddress || !password) && styles.buttonDisabled,
              pressed && styles.buttonPressed,
            ]}
            onPress={onSignUpPress}
            disabled={!emailAddress || !password}
          >
            <Text style={styles.buttonText}>Créer mon compte</Text>
          </Pressable>
          <View style={styles.linkContainer}>
            <Text style={styles.linkLabel}>Déjà inscrit ?</Text>
            <Link href="/sign-in" style={styles.linkText}>
              Se connecter
            </Link>
          </View>
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
    justifyContent: "center",
    gap: 14,
  },
  brandTop: {
    alignItems: "center",
    gap: 4,
  },
  brandIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.backgroundMuted,
    borderWidth: 1,
    borderColor: palette.border,
  },
  brandIconText: {
    color: palette.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  brandTitle: {
    color: palette.text,
    fontSize: 28,
    fontWeight: "800",
  },
  brandSubtitle: {
    color: palette.textMuted,
    textAlign: "center",
    fontSize: 14,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 16,
    gap: 10,
  },
  label: {
    fontWeight: "700",
    color: palette.text,
    fontSize: 13,
  },
  input: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    backgroundColor: palette.surfaceSoft,
    color: palette.text,
  },
  button: {
    backgroundColor: palette.primary,
    height: 46,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  buttonPressed: {
    backgroundColor: palette.primaryPressed,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
  linkContainer: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  linkLabel: {
    color: palette.textMuted,
    fontSize: 13,
  },
  linkText: {
    color: palette.accent,
    fontWeight: "700",
    fontSize: 13,
  },
});
