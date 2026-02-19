import { useAuth } from "@clerk/clerk-expo";
import { Redirect, useRouter } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
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
    return <Redirect href="/login" />;
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
          <ActivityIndicator size="small" color="#0a7ea4" />
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
        <View style={styles.container}>
          <Text style={styles.title}>Scanner un code-barres</Text>
          <Text style={styles.subtitle}>
            Autorise la camera pour scanner un produit.
          </Text>

          <Pressable style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Autoriser la camera</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={() => router.back()}>
            <Text style={styles.secondaryButtonText}>Retour</Text>
          </Pressable>
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
        <Text style={styles.title}>Scanner un code-barres</Text>
        <Text style={styles.subtitle}>
          Pointez la camera vers le code-barres du produit.
        </Text>

        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8", "upc_a"] }}
            onBarcodeScanned={isProcessing ? undefined : onBarcodeScanned}
          />
        </View>

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <Pressable style={styles.secondaryButton} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Retour</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f2f4f7",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    color: "#4b5563",
  },
  cameraContainer: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#111827",
  },
  camera: {
    flex: 1,
  },
  message: {
    color: "#374151",
    fontSize: 13,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#0a7ea4",
  },
  secondaryButton: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#0a7ea4",
  },
  secondaryButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
});
