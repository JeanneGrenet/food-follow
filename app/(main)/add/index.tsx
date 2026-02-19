import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
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

const MEAL_TYPES = ["Petit-dejeuner", "Dejeuner", "Diner", "Snack"] as const;

const TYPE_VISUALS: Record<
  (typeof MEAL_TYPES)[number],
  { icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  "Petit-dejeuner": { icon: "sunny-outline", color: "#d97706" },
  Dejeuner: { icon: "restaurant-outline", color: "#2563eb" },
  Diner: { icon: "moon-outline", color: "#6d28d9" },
  Snack: { icon: "cafe-outline", color: "#ea580c" },
};

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
        setScanMessage(`Aliment ajouté via scan: ${scannedFood.name}`);
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
      setScanMessage(`${food.name} est déjà dans le repas.`);
      setSearchText("");
      setResults([]);
      setSearchError(null);
      return;
    }

    addFoodToSelection(food);
    setScanMessage(`Aliment ajouté: ${food.name}`);
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
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerCard}>
          <View style={styles.headerIconWrap}>
            <Ionicons
              name="sparkles-outline"
              size={20}
              color={palette.primary}
            />
          </View>
          <View style={styles.headerTextWrap}>
            <Text style={styles.title}>Ajouter un repas</Text>
            <Text style={styles.subtitle}>
              Compose ton repas en 2 étapes simples
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionIndex}>1</Text>
            <Text style={styles.sectionTitle}>Choisir le type de repas</Text>
          </View>

          <View style={styles.chips}>
            {MEAL_TYPES.map((type) => {
              const selected = type === mealType;
              const visual = TYPE_VISUALS[type];

              return (
                <Pressable
                  key={type}
                  style={({ pressed }) => [
                    styles.chip,
                    selected && {
                      backgroundColor: `${visual.color}22`,
                      borderColor: visual.color,
                    },
                    pressed && styles.chipPressed,
                  ]}
                  onPress={() => setMealType(type)}
                >
                  <Ionicons
                    name={visual.icon}
                    size={15}
                    color={selected ? visual.color : palette.textMuted}
                  />
                  <Text
                    style={[
                      styles.chipText,
                      selected && { color: visual.color, fontWeight: "800" },
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
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionIndex}>2</Text>
            <Text style={styles.sectionTitle}>Ajouter des aliments</Text>
          </View>

          <View style={styles.searchWrap}>
            <Ionicons name="search" size={16} color={palette.textMuted} />
            <TextInput
              style={styles.input}
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Rechercher un aliment"
              placeholderTextColor={palette.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchText.length > 0 ? (
              <Pressable
                onPress={() => {
                  setSearchText("");
                  setResults([]);
                  setSearchError(null);
                }}
              >
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={palette.textMuted}
                />
              </Pressable>
            ) : null}
          </View>

          {isSearching ? (
            <View style={styles.inlineInfo}>
              <ActivityIndicator size="small" color={palette.primary} />
              <Text style={styles.infoText}>Recherche en cours...</Text>
            </View>
          ) : null}

          {scanMessage ? (
            <View style={styles.feedbackBanner}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={palette.primary}
              />
              <Text style={styles.successText}>{scanMessage}</Text>
            </View>
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
            <Ionicons name="scan-outline" size={16} color="#ffffff" />
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

              <View style={styles.resultActionBubble}>
                <Ionicons name="add" size={16} color="#ffffff" />
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.selectedHeader}>
            <Text style={styles.sectionTitle}>Aliments du repas</Text>
            <View style={styles.selectedCountBubble}>
              <Text style={styles.selectedCountText}>
                {selectedFoods.length}
              </Text>
            </View>
          </View>

          {selectedFoods.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="nutrition-outline"
                size={18}
                color={palette.textMuted}
              />
              <Text style={styles.emptyText}>
                Aucun aliment ajouté pour le moment
              </Text>
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
                  style={({ pressed }) => [
                    styles.removeButton,
                    pressed && styles.removeButtonPressed,
                  ]}
                  onPress={() => onRemoveFood(food.id)}
                >
                  <Ionicons name="close" size={13} color="#ffffff" />
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
          <Ionicons name="checkmark-circle-outline" size={17} color="#ffffff" />
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
    padding: 14,
    gap: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  headerIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.backgroundMuted,
  },
  headerTextWrap: {
    flex: 1,
    gap: 1,
  },
  title: {
    color: palette.text,
    fontSize: 24,
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
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionIndex: {
    width: 20,
    height: 20,
    borderRadius: 10,
    textAlign: "center",
    lineHeight: 20,
    color: "#ffffff",
    backgroundColor: palette.primary,
    fontWeight: "700",
    fontSize: 12,
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
    paddingHorizontal: 11,
    backgroundColor: palette.surfaceSoft,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  chipPressed: {
    opacity: 0.82,
  },
  chipText: {
    color: palette.text,
    fontWeight: "700",
    fontSize: 13,
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
  feedbackBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: "#eaf8ef",
    borderWidth: 1,
    borderColor: "#b6e1c4",
  },
  successText: {
    color: palette.primary,
    fontSize: 12,
    fontWeight: "700",
    flex: 1,
  },
  errorText: {
    color: palette.danger,
    fontSize: 13,
    fontWeight: "600",
  },
  scanButton: {
    borderRadius: radius.md,
    height: 44,
    backgroundColor: palette.accent,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
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
    opacity: 0.82,
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
  resultActionBubble: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.primary,
  },
  selectedHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectedCountBubble: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    backgroundColor: palette.backgroundMuted,
    borderWidth: 1,
    borderColor: palette.border,
  },
  selectedCountText: {
    color: palette.primary,
    fontWeight: "800",
    fontSize: 12,
  },
  emptyState: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surfaceSoft,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    color: palette.textMuted,
    fontSize: 13,
    flex: 1,
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
  removeButtonPressed: {
    opacity: 0.82,
  },
  submitButton: {
    borderRadius: radius.lg,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.primary,
    flexDirection: "row",
    gap: 8,
    shadowColor: palette.shadow,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
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
