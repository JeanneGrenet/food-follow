import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getMealCalories, type Food } from "../../models/meal";
import { useMeals } from "../../state/meals-context";

const NUTRI_SCORE_COLORS: Record<string, string> = {
  a: "#1f9d53",
  b: "#7cc44f",
  c: "#eab308",
  d: "#f97316",
  e: "#ef4444",
};

const MetricBox = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) => {
  return (
    <View style={[styles.metricBox, { borderColor: color }]}>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
};

const FoodCard = ({ food }: { food: Food }) => {
  const nutriScore = (food.nutriscore || "e").toLowerCase();
  const nutriColor = NUTRI_SCORE_COLORS[nutriScore] ?? NUTRI_SCORE_COLORS.e;

  return (
    <View style={styles.foodCard}>
      <View style={styles.foodTopRow}>
        <View style={styles.foodIdentity}>
          {food.image_url ? (
            <Image source={{ uri: food.image_url }} style={styles.foodImage} />
          ) : (
            <View style={[styles.foodImage, styles.foodImagePlaceholder]} />
          )}
          <View>
            <Text style={styles.foodName}>{food.name}</Text>
            <Text style={styles.foodBrand}>{food.brand || "Marque inconnue"}</Text>
          </View>
        </View>

        <View style={[styles.nutriBadge, { backgroundColor: nutriColor }]}>
          <Text style={styles.nutriBadgeText}>{nutriScore.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <MetricBox label="Cal" value={`${food.calories} kcal`} color="#27ae60" />
        <MetricBox label="Proteines" value={`${food.proteins} g`} color="#3b82f6" />
        <MetricBox label="Glucides" value={`${food.carbs} g`} color="#f59e0b" />
        <MetricBox label="Lipides" value={`${food.fats} g`} color="#ef4444" />
      </View>
    </View>
  );
};

export default function MealDetailsPage() {
  const router = useRouter();
  const { meals } = useMeals();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const mealId = Array.isArray(params.id) ? params.id[0] : params.id;
  const meal = meals.find((item) => item.id === mealId);

  if (!meal) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <View style={styles.container}>
          <Text style={styles.title}>Repas introuvable</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totals = meal.foods.reduce(
    (acc, food) => {
      acc.calories += food.calories;
      acc.proteins += food.proteins;
      acc.carbs += food.carbs;
      acc.fats += food.fats;
      return acc;
    },
    { calories: 0, proteins: 0, carbs: 0, fats: 0 }
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{"< Mes repas"}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Détail du repas</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{meal.name}</Text>
        <Text style={styles.subtitle}>{meal.date}</Text>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Total nutritionnel</Text>
          <View style={styles.metricsRow}>
            <MetricBox label="Cal" value={`${getMealCalories(meal)} kcal`} color="#27ae60" />
            <MetricBox label="Proteines" value={`${totals.proteins} g`} color="#3b82f6" />
            <MetricBox label="Glucides" value={`${totals.carbs} g`} color="#f59e0b" />
            <MetricBox label="Lipides" value={`${totals.fats} g`} color="#ef4444" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Aliments ({meal.foods.length})</Text>
        {meal.foods.map((food) => (
          <FoodCard key={food.id} food={food} />
        ))}

        <Pressable
          style={styles.deleteButton}
          onPress={() =>
            Alert.alert(
              "Suppression",
              "Le bouton est prêt. La suppression sera branchée sur la persistance au prochain palier."
            )
          }
        >
          <Text style={styles.deleteButtonText}>Supprimer ce repas</Text>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    minWidth: 84,
  },
  backButtonText: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  headerSpacer: {
    minWidth: 84,
  },
  container: {
    padding: 20,
    gap: 12,
    paddingBottom: 28,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    color: "#6b7280",
    marginBottom: 6,
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    gap: 10,
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  metricsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metricBox: {
    minWidth: 72,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    alignItems: "center",
  },
  metricValue: {
    fontSize: 12,
    fontWeight: "700",
  },
  metricLabel: {
    fontSize: 10,
    color: "#9ca3af",
    marginTop: 2,
  },
  foodCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    gap: 10,
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  foodTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  foodIdentity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  foodImage: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  foodImagePlaceholder: {
    backgroundColor: "#dbeafe",
  },
  foodName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  foodBrand: {
    color: "#6b7280",
    fontSize: 12,
  },
  nutriBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  nutriBadgeText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 12,
  },
  deleteButton: {
    marginTop: 12,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#ef4444",
  },
  deleteButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
});
