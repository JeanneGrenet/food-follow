import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getMealCalories, type Food } from "../../models/meal";
import { useMeals } from "../../state/meals-context";
import { palette, radius } from "../../theme";

const NUTRI_SCORE_COLORS: Record<string, string> = {
  a: "#2f9e62",
  b: "#6bbf59",
  c: "#f4a340",
  d: "#ef7e4a",
  e: "#e64949",
};

const MacroChip = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) => (
  <View
    style={[
      styles.metricBox,
      { borderColor: color + "60", backgroundColor: color + "12" },
    ]}
  >
    <Text style={[styles.metricValue, { color }]}>{value}</Text>
    <Text style={styles.metricLabel}>{label}</Text>
  </View>
);

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
            <View style={[styles.foodImage, styles.foodImagePlaceholder]}>
              <Text style={styles.imagePlaceholderText}>IMG</Text>
            </View>
          )}

          <View style={styles.foodTextWrap}>
            <Text style={styles.foodName}>{food.name}</Text>
            <Text style={styles.foodBrand}>
              {food.brand || "Marque inconnue"}
            </Text>
          </View>
        </View>

        <View style={[styles.nutriBadge, { backgroundColor: nutriColor }]}>
          <Text style={styles.nutriBadgeText}>{nutriScore.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <MacroChip
          label="Calories"
          value={`${food.calories} kcal`}
          color="#2f9e62"
        />
        <MacroChip
          label="Protéines"
          value={`${food.proteins} g`}
          color="#2563eb"
        />
        <MacroChip label="Glucides" value={`${food.carbs} g`} color="#d97706" />
        <MacroChip label="Lipides" value={`${food.fats} g`} color="#dc2626" />
      </View>
    </View>
  );
};

export default function MealDetailsPage() {
  const router = useRouter();
  const { meals, removeMeal } = useMeals();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const mealId = Array.isArray(params.id) ? params.id[0] : params.id;
  const meal = meals.find((item) => item.id === mealId);

  if (!meal) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={["top", "left", "right", "bottom"]}
      >
        <View style={styles.notFoundWrap}>
          <Text style={styles.notFoundTitle}>Repas introuvable</Text>
          <Pressable
            style={styles.backListButton}
            onPress={() => router.replace("/(main)/(home)")}
          >
            <Text style={styles.backListButtonText}>Retour à mes repas</Text>
          </Pressable>
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

  const onDeleteMeal = () => {
    Alert.alert("Supprimer ce repas", "Confirmer la suppression ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: () => {
          removeMeal(meal.id);
          router.replace("/(main)/(home)");
        },
      },
    ]);
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right", "bottom"]}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconButton}>
          <Text style={styles.iconButtonText}>{"<"}</Text>
        </Pressable>

        <Text style={styles.headerTitle}>Détail du repas</Text>
        <View style={styles.iconButtonGhost} />
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mealHeadCard}>
          <Text style={styles.title}>{meal.name}</Text>
          <Text style={styles.subtitle}>{meal.date}</Text>
          <Text style={styles.totalKcal}>{getMealCalories(meal)} kcal</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Total nutritionnel</Text>
          <View style={styles.metricsRow}>
            <MacroChip
              label="Calories"
              value={`${totals.calories} kcal`}
              color="#2f9e62"
            />
            <MacroChip
              label="Protéines"
              value={`${totals.proteins} g`}
              color="#2563eb"
            />
            <MacroChip
              label="Glucides"
              value={`${totals.carbs} g`}
              color="#d97706"
            />
            <MacroChip
              label="Lipides"
              value={`${totals.fats} g`}
              color="#dc2626"
            />
          </View>
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Aliments</Text>
          <Text style={styles.sectionMeta}>{meal.foods.length} éléments</Text>
        </View>

        {meal.foods.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              Ce repas ne contient pas encore d'aliments.
            </Text>
          </View>
        ) : (
          meal.foods.map((food) => <FoodCard key={food.id} food={food} />)
        )}

        <Pressable
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && styles.deleteButtonPressed,
          ]}
          onPress={onDeleteMeal}
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
    backgroundColor: palette.background,
  },
  header: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  iconButtonText: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "700",
  },
  iconButtonGhost: {
    width: 34,
    height: 34,
  },
  headerTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "700",
  },
  container: {
    padding: 16,
    paddingBottom: 110,
    gap: 12,
  },
  mealHeadCard: {
    backgroundColor: palette.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 16,
    gap: 3,
  },
  title: {
    color: palette.text,
    fontSize: 27,
    fontWeight: "800",
  },
  subtitle: {
    color: palette.textMuted,
    fontSize: 13,
  },
  totalKcal: {
    marginTop: 4,
    color: palette.primary,
    fontSize: 22,
    fontWeight: "800",
  },
  sectionCard: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 12,
    gap: 8,
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "700",
  },
  sectionMeta: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metricBox: {
    minWidth: 78,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 8,
    paddingVertical: 7,
    gap: 2,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: "800",
  },
  metricLabel: {
    fontSize: 11,
    color: palette.textMuted,
    fontWeight: "600",
  },
  foodCard: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.lg,
    padding: 12,
    gap: 10,
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
    flex: 1,
  },
  foodImage: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: palette.backgroundMuted,
  },
  foodImagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: palette.border,
  },
  imagePlaceholderText: {
    color: palette.textMuted,
    fontSize: 10,
    fontWeight: "700",
  },
  foodTextWrap: {
    flex: 1,
  },
  foodName: {
    color: palette.text,
    fontSize: 15,
    fontWeight: "700",
  },
  foodBrand: {
    color: palette.textMuted,
    fontSize: 12,
    marginTop: 1,
  },
  nutriBadge: {
    minWidth: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  nutriBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
  },
  emptyCard: {
    backgroundColor: palette.surfaceSoft,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.lg,
    padding: 14,
  },
  emptyText: {
    color: palette.textMuted,
    fontSize: 13,
  },
  deleteButton: {
    marginTop: 8,
    height: 48,
    borderRadius: 14,
    backgroundColor: palette.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonPressed: {
    opacity: 0.85,
  },
  deleteButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
  notFoundWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 20,
  },
  notFoundTitle: {
    color: palette.text,
    fontSize: 22,
    fontWeight: "800",
  },
  backListButton: {
    marginTop: 6,
    backgroundColor: palette.primary,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backListButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
});
