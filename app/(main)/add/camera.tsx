import { useAuth } from "@clerk/clerk-expo";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Redirect, useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { mapFoodProductToFood } from "../../models/food-mapper";
import { getFoodByBarcode } from "../../services/open-food-facts";
import { setPendingScannedFood } from "../../state/pending-scanned-food";
import { palette, radius } from "../../theme";

export default function AddCameraPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const processingRef = useRef(false);

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  const onBarcodeScanned = async ({ data }: { data: string }) => {
    if (processingRef.current) {
      return;
    }

    processingRef.current = true;
    setIsProcessing(true);
    setMessage("Recherche du produit...");

    try {
      const product = await getFoodByBarcode(data);

      if (!product) {
        setMessage("Produit non trouve dans la base Open Food Facts.");
        return;
      }

      setPendingScannedFood(mapFoodProductToFood(product));
      router.back();
    } catch {
      setMessage("Erreur pendant le scan. Reessaie.");
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
    }
  };

  if (!permission) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={["top", "left", "right", "bottom"]}
      >
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color={palette.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={["top", "left", "right", "bottom"]}
      >
        <View style={styles.permissionWrap}>
          <View style={styles.permissionCard}>
            <View style={styles.permissionIcon}>
              <Text style={styles.permissionIconText}>SCAN</Text>
            </View>

            <Text style={styles.title}>Scanner un code-barres</Text>
            <Text style={styles.subtitle}>
              Autorise la caméra pour scanner un produit.
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
              onPress={requestPermission}
            >
              <Text style={styles.buttonText}>Autoriser la caméra</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.secondaryButtonPressed,
              ]}
              onPress={() => router.back()}
            >
              <Text style={styles.secondaryButtonText}>Retour</Text>
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
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>{"<"}</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Scan code-barres</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ["ean13", "ean8", "upc_a"],
            }}
            onBarcodeScanned={isProcessing ? undefined : onBarcodeScanned}
          />

          <View style={styles.scannerFrame} pointerEvents="none" />
        </View>

        <View style={styles.helpCard}>
          <Text style={styles.helpText}>
            Centre le code-barres dans le cadre.
          </Text>
        </View>

        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  permissionWrap: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  permissionCard: {
    backgroundColor: palette.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 18,
    gap: 10,
    alignItems: "center",
  },
  permissionIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.backgroundMuted,
    borderWidth: 1,
    borderColor: palette.border,
  },
  permissionIconText: {
    color: palette.primary,
    fontWeight: "800",
    fontSize: 11,
  },
  container: {
    flex: 1,
    padding: 16,
    gap: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  backButtonText: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "700",
  },
  headerSpacer: {
    width: 34,
    height: 34,
  },
  headerTitle: {
    color: palette.text,
    fontWeight: "700",
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: palette.text,
  },
  subtitle: {
    color: palette.textMuted,
    textAlign: "center",
  },
  cameraContainer: {
    flex: 1,
    borderRadius: radius.xl,
    overflow: "hidden",
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: palette.border,
  },
  camera: {
    flex: 1,
  },
  scannerFrame: {
    position: "absolute",
    top: "28%",
    left: "10%",
    right: "10%",
    height: 160,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#ffffffd0",
  },
  helpCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    paddingHorizontal: 10,
    paddingVertical: 9,
    alignItems: "center",
  },
  helpText: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  message: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  button: {
    marginTop: 6,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    minWidth: 220,
    alignItems: "center",
    backgroundColor: palette.primary,
  },
  buttonPressed: {
    backgroundColor: palette.primaryPressed,
  },
  secondaryButton: {
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    minWidth: 220,
    alignItems: "center",
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surfaceSoft,
  },
  secondaryButtonPressed: {
    opacity: 0.8,
  },
  secondaryButtonText: {
    color: palette.text,
    fontWeight: "700",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "800",
  },
});
