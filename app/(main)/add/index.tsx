import { useAuth } from "@clerk/clerk-expo";
import { Redirect, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { mapFoodProductToFood } from "../../models/food-mapper";
import { type Food } from "../../models/meal";
import {
  searchFoodsByText,
  type FoodProduct,
} from "../../services/open-food-facts";
import { useMeals } from "../../state/meals-context";
import { consumePendingScannedFood } from "../../state/pending-scanned-food";
import { palette, radius } from "../../theme";
import { Ionicons } from "@expo/vector-icons";

const MEAL_TYPES = ["Petit-dejeuner", "Dejeuner", "Diner", "Snack"] as const;

export default function AddMealPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const { addMeal } = useMeals();

  const [mealType, setMealType] =
    useState<(typeof MEAL_TYPES)[number]>("Snack");
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState<FoodProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedFoods, setSelectedFoods] = useState<Food[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const addFoodToSelection = useCallback((food: Food) => {
    setSelectedFoods((prev) => {
      if (prev.some((item) => item.id === food.id)) {
        return prev;
      }
      return [...prev, food];
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      const scannedFood = consumePendingScannedFood();
      if (scannedFood) {
        addFoodToSelection(scannedFood);
        setScanMessage(`Aliment ajoute via scan: ${scannedFood.name}`);
        setSearchText("");
        setResults([]);
        setSearchError(null);
      }

      return undefined;
    }, [addFoodToSelection])
  );

  useEffect(() => {
    const query = searchText.trim();

    if (query.length < 2) {
      setResults([]);
      setSearchError(null);
      setIsSearching(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);

      try {
        const foods = await searchFoodsByText(query, { pageSize: 10 });
        if (requestId !== requestIdRef.current) {
          return;
        }
        setResults(foods);
      } catch {
        if (requestId !== requestIdRef.current) {
          return;
        }
        setResults([]);
        setSearchError("Recherche impossible pour le moment.");
      } finally {
        if (requestId === requestIdRef.current) {
          setIsSearching(false);
        }
      }
    }, 450);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchText]);

  const onAddFood = (product: FoodProduct) => {
    const food = mapFoodProductToFood(product);
    const alreadySelected = selectedFoods.some((item) => item.id === food.id);

    if (alreadySelected) {
      setScanMessage(`${food.name} est deja dans le repas.`);
      setSearchText("");
      setResults([]);
      setSearchError(null);
      return;
    }

    addFoodToSelection(food);
    setScanMessage(`Aliment ajoute: ${food.name}`);
    setSearchText("");
    setResults([]);
    setSearchError(null);
    setFormError(null);
  };

  const onRemoveFood = (foodId: string) => {
    setSelectedFoods((prev) => prev.filter((food) => food.id !== foodId));
  };

  const onSaveMeal = () => {
    if (selectedFoods.length === 0) {
      setFormError("Ajoute au moins un aliment avant de valider.");
      return;
    }

    const meal = {
      id: `${Date.now()}`,
      name: mealType,
      date: new Date().toISOString().slice(0, 10),
      foods: selectedFoods,
    };

    addMeal(meal);
    router.replace("/(main)/(home)");
  };

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right", "bottom"]}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerCard}>
          <Text style={styles.title}>Ajouter un repas</Text>
          <Text style={styles.subtitle}>Compose ton repas en 2 étapes</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Type de repas</Text>
          <View style={styles.chips}>
            {MEAL_TYPES.map((type) => {
              const selected = type === mealType;
              return (
                <Pressable
                  key={type}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => setMealType(type)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selected && styles.chipTextSelected,
                    ]}
                  >
                    {type}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Ajouter des aliments</Text>

          <View style={styles.searchWrap}>
            <Ionicons name={"search"} />
            <TextInput
              style={styles.input}
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Rechercher un aliment"
              placeholderTextColor={palette.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Text style={styles.helperText}>
            Debounce actif pour respecter la limite API.
          </Text>

          {isSearching ? (
            <View style={styles.inlineInfo}>
              <ActivityIndicator size="small" color={palette.primary} />
              <Text style={styles.infoText}>Recherche en cours...</Text>
            </View>
          ) : null}

          {scanMessage ? (
            <Text style={styles.successText}>{scanMessage}</Text>
          ) : null}
          {searchError ? (
            <Text style={styles.errorText}>{searchError}</Text>
          ) : null}

          <Pressable
            style={({ pressed }) => [
              styles.scanButton,
              pressed && styles.scanButtonPressed,
            ]}
            onPress={() => router.push("/add/camera")}
          >
            <Text style={styles.scanButtonText}>Scanner un code-barres</Text>
          </Pressable>

          {results.map((result) => (
            <Pressable
              key={`${result.code}-${result.name}`}
              style={({ pressed }) => [
                styles.resultItem,
                pressed && styles.resultItemPressed,
              ]}
              onPress={() => onAddFood(result)}
            >
              <View style={styles.resultTextWrap}>
                <Text style={styles.resultName}>{result.name}</Text>
                <Text style={styles.resultMeta}>
                  {result.brand ?? "Marque inconnue"}
                </Text>
              </View>
              <Text style={styles.resultAction}>+</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.selectedHeader}>
            <Text style={styles.sectionTitle}>Aliments du repas</Text>
            <Text style={styles.sectionMeta}>{selectedFoods.length}</Text>
          </View>

          {selectedFoods.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Aucun aliment ajouté</Text>
            </View>
          ) : (
            selectedFoods.map((food) => (
              <View key={food.id} style={styles.selectedRow}>
                <View style={styles.selectedText}>
                  <Text style={styles.selectedName}>{food.name}</Text>
                  <Text style={styles.selectedMeta}>
                    {food.calories} kcal • P {food.proteins}g • G {food.carbs}g
                    • L {food.fats}g
                  </Text>
                </View>
                <Pressable
                  style={styles.removeButton}
                  onPress={() => onRemoveFood(food.id)}
                >
                  <Text style={styles.removeButtonText}>x</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>

        {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            pressed && styles.submitButtonPressed,
          ]}
          onPress={onSaveMeal}
        >
          <Text style={styles.submitButtonText}>Valider le repas</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  container: {
    padding: 16,
    gap: 12,
    paddingBottom: 120,
  },
  headerCard: {
    backgroundColor: palette.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 16,
    gap: 2,
  },
  title: {
    color: palette.text,
    fontSize: 26,
    fontWeight: "800",
  },
  subtitle: {
    color: palette.textMuted,
    fontSize: 13,
  },
  section: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 12,
    gap: 10,
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "700",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.border,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: palette.surfaceSoft,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  chipSelected: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  chipText: {
    color: palette.text,
    fontWeight: "700",
    fontSize: 13,
  },
  chipTextSelected: {
    color: "#ffffff",
  },
  searchWrap: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.md,
    backgroundColor: palette.surfaceSoft,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchPrefix: {
    color: palette.textMuted,
    fontSize: 11,
    fontWeight: "700",
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    color: palette.text,
  },
  helperText: {
    color: palette.textMuted,
    fontSize: 12,
  },
  inlineInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    color: palette.textMuted,
    fontSize: 13,
  },
  scanButton: {
    borderRadius: radius.md,
    height: 44,
    backgroundColor: palette.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  scanButtonPressed: {
    opacity: 0.86,
  },
  scanButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  resultItem: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.md,
    backgroundColor: palette.surfaceSoft,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  resultItemPressed: {
    opacity: 0.8,
  },
  resultTextWrap: {
    flex: 1,
    gap: 2,
  },
  resultName: {
    color: palette.text,
    fontSize: 14,
    fontWeight: "700",
  },
  resultMeta: {
    color: palette.textMuted,
    fontSize: 12,
  },
  resultAction: {
    color: palette.primary,
    fontWeight: "700",
    fontSize: 22,
    lineHeight: 22,
  },
  selectedHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionMeta: {
    color: palette.primary,
    fontWeight: "800",
    fontSize: 14,
  },
  emptyState: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surfaceSoft,
    padding: 12,
  },
  emptyText: {
    color: palette.textMuted,
    fontSize: 13,
  },
  selectedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.md,
    padding: 10,
    backgroundColor: palette.surfaceSoft,
  },
  selectedText: {
    flex: 1,
    gap: 2,
  },
  selectedName: {
    fontWeight: "700",
    color: palette.text,
  },
  selectedMeta: {
    color: palette.textMuted,
    fontSize: 12,
  },
  removeButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.danger,
  },
  removeButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 13,
    lineHeight: 14,
  },
  errorText: {
    color: palette.danger,
    fontSize: 13,
    fontWeight: "600",
    marginTop: -2,
  },
  successText: {
    color: palette.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  submitButton: {
    borderRadius: radius.lg,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.primary,
  },
  submitButtonPressed: {
    backgroundColor: palette.primaryPressed,
  },
  submitButtonText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 15,
  },
});
