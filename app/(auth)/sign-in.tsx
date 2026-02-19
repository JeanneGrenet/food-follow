import { useSignIn } from "@clerk/clerk-expo";
import type { EmailCodeFactor } from "@clerk/types";
import { Link, useRouter } from "expo-router";
import * as React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { palette, radius } from "../theme";
import { Ionicons } from "@expo/vector-icons";

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [showEmailCode, setShowEmailCode] = React.useState(false);

  const onSignInPress = React.useCallback(async () => {
    if (!isLoaded) return;

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({
          session: signInAttempt.createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              console.log(session?.currentTask);
              return;
            }

            router.replace("/");
          },
        });
      } else if (signInAttempt.status === "needs_second_factor") {
        const emailCodeFactor = signInAttempt.supportedSecondFactors?.find(
          (factor): factor is EmailCodeFactor =>
            factor.strategy === "email_code"
        );

        if (emailCodeFactor) {
          await signIn.prepareSecondFactor({
            strategy: "email_code",
            emailAddressId: emailCodeFactor.emailAddressId,
          });
          setShowEmailCode(true);
        }
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  }, [isLoaded, signIn, setActive, router, emailAddress, password]);

  const onVerifyPress = React.useCallback(async () => {
    if (!isLoaded) return;

    try {
      const signInAttempt = await signIn.attemptSecondFactor({
        strategy: "email_code",
        code,
      });

      if (signInAttempt.status === "complete") {
        await setActive({
          session: signInAttempt.createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              console.log(session?.currentTask);
              return;
            }

            router.replace("/");
          },
        });
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  }, [isLoaded, signIn, setActive, router, code]);

  if (showEmailCode) {
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
            <Text style={styles.brandTitle}>Vérification email</Text>
            <Text style={styles.brandSubtitle}>
              Saisis le code reçu pour finaliser la connexion.
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
          <Text style={styles.brandTitle}>Bon retour</Text>
          <Text style={styles.brandSubtitle}>
            Connecte-toi pour suivre tes repas et ton équilibre.
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
            onChangeText={(nextEmail) => setEmailAddress(nextEmail)}
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
            onPress={onSignInPress}
            disabled={!emailAddress || !password}
          >
            <Text style={styles.buttonText}>Se connecter</Text>
          </Pressable>

          <View style={styles.linkContainer}>
            <Text style={styles.linkLabel}>Pas encore de compte ?</Text>
            <Link href="/sign-up" style={styles.linkText}>
              Créer un compte
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
