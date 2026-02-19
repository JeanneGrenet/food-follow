import { Ionicons } from "@expo/vector-icons";
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

const getMealVisual = (mealName: string) => {
  const normalized = mealName.toLowerCase();

  if (normalized.includes("petit")) {
    return {
      icon: "sunny-outline" as const,
      accent: "#d97706",
      soft: "#fff7e8",
      border: "#f7d6a5",
    };
  }

  if (normalized.includes("dejeuner")) {
    return {
      icon: "restaurant-outline" as const,
      accent: "#2563eb",
      soft: "#edf4ff",
      border: "#cfe0ff",
    };
  }

  if (normalized.includes("diner")) {
    return {
      icon: "moon-outline" as const,
      accent: "#6d28d9",
      soft: "#f5f0ff",
      border: "#dfd2ff",
    };
  }

  return {
    icon: "cafe-outline" as const,
    accent: "#ea580c",
    soft: "#fff2e7",
    border: "#ffd5bc",
  };
};

const MacroTile = ({
  icon,
  label,
  value,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
}) => (
  <View style={[styles.macroTile, { borderColor: `${color}55`, backgroundColor: `${color}15` }]}>
    <View style={[styles.macroIconWrap, { backgroundColor: `${color}22` }]}>
      <Ionicons name={icon} size={13} color={color} />
    </View>
    <Text style={[styles.macroValue, { color }]}>{value}</Text>
    <Text style={styles.macroLabel}>{label}</Text>
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
              <Ionicons name="image-outline" size={15} color={palette.textMuted} />
            </View>
          )}

          <View style={styles.foodTextWrap}>
            <Text style={styles.foodName}>{food.name}</Text>
            <Text style={styles.foodBrand}>{food.brand || "Marque inconnue"}</Text>
          </View>
        </View>

        <View style={[styles.nutriBadge, { backgroundColor: nutriColor }]}>
          <Text style={styles.nutriBadgeText}>{nutriScore.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.foodMetricsRow}>
        <View style={[styles.foodMetricPill, styles.foodMetricGreen]}>
          <Text style={styles.foodMetricText}>{food.calories} kcal</Text>
        </View>
        <View style={[styles.foodMetricPill, styles.foodMetricBlue]}>
          <Text style={styles.foodMetricText}>{food.proteins} g P</Text>
        </View>
        <View style={[styles.foodMetricPill, styles.foodMetricOrange]}>
          <Text style={styles.foodMetricText}>{food.carbs} g G</Text>
        </View>
        <View style={[styles.foodMetricPill, styles.foodMetricRed]}>
          <Text style={styles.foodMetricText}>{food.fats} g L</Text>
        </View>
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
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
        <View style={styles.notFoundWrap}>
          <Ionicons name="alert-circle-outline" size={28} color={palette.textMuted} />
          <Text style={styles.notFoundTitle}>Repas introuvable</Text>
          <Pressable
            style={({ pressed }) => [styles.backListButton, pressed && styles.backListButtonPressed]}
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

  const visual = getMealVisual(meal.name);

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
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
        >
          <Ionicons name="chevron-back" size={18} color={palette.text} />
        </Pressable>

        <Text style={styles.headerTitle}>Détail du repas</Text>
        <View style={styles.iconButtonGhost} />
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.mealHeadCard,
            { backgroundColor: visual.soft, borderColor: visual.border },
          ]}
        >
          <View style={styles.mealHeadTop}>
            <View style={[styles.mealTypeIcon, { backgroundColor: `${visual.accent}22` }]}>
              <Ionicons name={visual.icon} size={19} color={visual.accent} />
            </View>

            <View style={styles.mealHeadTextWrap}>
              <Text style={styles.title}>{meal.name}</Text>
              <Text style={styles.subtitle}>{meal.date}</Text>
            </View>
          </View>

          <View style={styles.mealHeadBottom}>
            <Text style={[styles.totalKcal, { color: visual.accent }]}>
              {getMealCalories(meal)} kcal
            </Text>
            <Text style={styles.mealHeadBottomMeta}>{meal.foods.length} aliments</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Total nutritionnel</Text>
          <View style={styles.macroGrid}>
            <MacroTile icon="flame-outline" label="Calories" value={`${totals.calories} kcal`} color="#2f9e62" />
            <MacroTile icon="barbell-outline" label="Protéines" value={`${totals.proteins} g`} color="#2563eb" />
            <MacroTile icon="leaf-outline" label="Glucides" value={`${totals.carbs} g`} color="#d97706" />
            <MacroTile icon="water-outline" label="Lipides" value={`${totals.fats} g`} color="#dc2626" />
          </View>
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Aliments</Text>
          <Text style={styles.sectionMeta}>{meal.foods.length} éléments</Text>
        </View>

        {meal.foods.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="nutrition-outline" size={19} color={palette.textMuted} />
            <Text style={styles.emptyText}>Ce repas ne contient pas encore d'aliments.</Text>
          </View>
        ) : (
          meal.foods.map((food) => <FoodCard key={food.id} food={food} />)
        )}

        <Pressable
          style={({ pressed }) => [styles.deleteButton, pressed && styles.deleteButtonPressed]}
          onPress={onDeleteMeal}
        >
          <Ionicons name="trash-outline" size={16} color="#ffffff" />
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
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  iconButtonPressed: {
    opacity: 0.8,
  },
  iconButtonGhost: {
    width: 36,
    height: 36,
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
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  mealHeadTop: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  mealTypeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  mealHeadTextWrap: {
    flex: 1,
  },
  title: {
    color: palette.text,
    fontSize: 25,
    fontWeight: "800",
  },
  subtitle: {
    color: palette.textMuted,
    fontSize: 13,
    marginTop: 1,
  },
  mealHeadBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  totalKcal: {
    fontSize: 24,
    fontWeight: "800",
  },
  mealHeadBottomMeta: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  sectionCard: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 12,
    gap: 9,
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
  macroGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  macroTile: {
    minWidth: 76,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: 8,
    paddingHorizontal: 8,
    gap: 3,
  },
  macroIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  macroValue: {
    fontSize: 12,
    fontWeight: "800",
  },
  macroLabel: {
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
    shadowColor: palette.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
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
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: palette.backgroundMuted,
  },
  foodImagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: palette.border,
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
  foodMetricsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  foodMetricPill: {
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
  },
  foodMetricGreen: {
    backgroundColor: "#eaf8ef",
    borderColor: "#b6e1c4",
  },
  foodMetricBlue: {
    backgroundColor: "#edf3ff",
    borderColor: "#c7d7ff",
  },
  foodMetricOrange: {
    backgroundColor: "#fff6e9",
    borderColor: "#f8dcb6",
  },
  foodMetricRed: {
    backgroundColor: "#ffefef",
    borderColor: "#f6c5c5",
  },
  foodMetricText: {
    color: palette.text,
    fontSize: 11,
    fontWeight: "700",
  },
  emptyCard: {
    backgroundColor: palette.surfaceSoft,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.lg,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    color: palette.textMuted,
    fontSize: 13,
    flex: 1,
  },
  deleteButton: {
    marginTop: 8,
    height: 48,
    borderRadius: 14,
    backgroundColor: palette.danger,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
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
  backListButtonPressed: {
    backgroundColor: palette.primaryPressed,
  },
  backListButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
});
