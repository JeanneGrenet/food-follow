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
import { type Food } from "../../models/meal";
import {
  searchFoodsByText,
  type FoodProduct,
} from "../../services/open-food-facts";
import { useMeals } from "../../state/meals-context";
import { consumePendingScannedFood } from "../../state/pending-scanned-food";
import { mapFoodProductToFood } from "../../models/food-mapper";

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
    addFoodToSelection(mapFoodProductToFood(product));
    setScanMessage(null);
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
    return <Redirect href="/login" />;
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right", "bottom"]}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Ajouter un repas</Text>

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
          <TextInput
            style={styles.input}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Rechercher un aliment"
            placeholderTextColor="#666666"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {isSearching ? (
            <ActivityIndicator size="small" color="#0a7ea4" />
          ) : null}
          {scanMessage ? (
            <Text style={styles.successText}>{scanMessage}</Text>
          ) : null}
          {searchError ? (
            <Text style={styles.errorText}>{searchError}</Text>
          ) : null}

          <Pressable
            style={[styles.button, styles.secondaryButton]}
            onPress={() => router.push("/add/camera")}
          >
            <Text style={styles.buttonText}>Scanner un code-barres</Text>
          </Pressable>

          {results.map((result) => (
            <Pressable
              key={`${result.code}-${result.name}`}
              style={styles.resultItem}
              onPress={() => onAddFood(result)}
            >
              <Text style={styles.resultName}>{result.name}</Text>
              <Text style={styles.resultMeta}>
                {result.brand ?? "Marque inconnue"}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Aliments du repas ({selectedFoods.length})
          </Text>
          {selectedFoods.length === 0 ? (
            <Text style={styles.emptyText}>Aucun aliment ajoute.</Text>
          ) : (
            selectedFoods.map((food) => (
              <View key={food.id} style={styles.selectedRow}>
                <View style={styles.selectedText}>
                  <Text style={styles.selectedName}>{food.name}</Text>
                  <Text style={styles.selectedMeta}>
                    {food.calories} kcal - {food.proteins}g P - {food.carbs}g G
                    - {food.fats}g L
                  </Text>
                </View>
                <Pressable
                  style={styles.removeButton}
                  onPress={() => onRemoveFood(food.id)}
                >
                  <Text style={styles.removeButtonText}>Retirer</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>

        {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

        <Pressable style={styles.button} onPress={onSaveMeal}>
          <Text style={styles.buttonText}>Valider</Text>
        </Pressable>
      </ScrollView>
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
    gap: 12,
    paddingBottom: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  section: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: "#ffffff",
  },
  chipSelected: {
    backgroundColor: "#0a7ea4",
    borderColor: "#0a7ea4",
  },
  chipText: {
    color: "#374151",
    fontWeight: "600",
  },
  chipTextSelected: {
    color: "#ffffff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
  },
  hint: {
    color: "#6b7280",
    fontSize: 12,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#0a7ea4",
  },
  secondaryButton: {
    backgroundColor: "#0f9d58",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  resultItem: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 10,
    gap: 2,
  },
  resultName: {
    color: "#111827",
    fontWeight: "700",
  },
  resultMeta: {
    color: "#6b7280",
    fontSize: 12,
  },
  emptyText: {
    color: "#6b7280",
    fontStyle: "italic",
  },
  selectedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 10,
  },
  selectedText: {
    flex: 1,
    gap: 2,
  },
  selectedName: {
    fontWeight: "700",
    color: "#111827",
  },
  selectedMeta: {
    color: "#6b7280",
    fontSize: 12,
  },
  removeButton: {
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#fee2e2",
  },
  removeButtonText: {
    color: "#dc2626",
    fontWeight: "700",
    fontSize: 12,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 13,
  },
  successText: {
    color: "#15803d",
    fontSize: 13,
  },
});
