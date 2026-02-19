import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getMealCalories, type Meal } from "../../models/meal";
import { useMeals } from "../../state/meals-context";
import { palette, radius } from "../../theme";

type MealVisual = {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  soft: string;
  border: string;
};

type DayGroup = {
  date: string;
  meals: Meal[];
  summary: {
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
  };
};

const getMealVisual = (mealName: string): MealVisual => {
  const normalized = mealName.toLowerCase();

  if (normalized.includes("petit")) {
    return {
      icon: "sunny-outline",
      color: "#d97706",
      soft: "#fffbeb",
      border: "#fcd9a6",
    };
  }

  if (normalized.includes("dejeuner")) {
    return {
      icon: "restaurant-outline",
      color: "#2563eb",
      soft: "#eff6ff",
      border: "#bfdbfe",
    };
  }

  if (normalized.includes("diner")) {
    return {
      icon: "moon-outline",
      color: "#6d28d9",
      soft: "#f5f3ff",
      border: "#ddd6fe",
    };
  }

  return {
    icon: "cafe-outline",
    color: "#ea580c",
    soft: "#fff7ed",
    border: "#fed7aa",
  };
};

const formatDayLabel = (date: string) => {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  const formatted = parsed.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

const formatMacro = (value: number) =>
  Number.isInteger(value) ? `${value}` : value.toFixed(1);

export default function HomePage() {
  const { meals } = useMeals();

  const groupedMeals = useMemo<DayGroup[]>(() => {
    const groupsMap = new Map<string, DayGroup>();

    for (const meal of meals) {
      const existing = groupsMap.get(meal.date);

      const mealSummary = meal.foods.reduce(
        (acc, food) => {
          acc.calories += food.calories;
          acc.proteins += food.proteins;
          acc.carbs += food.carbs;
          acc.fats += food.fats;
          return acc;
        },
        { calories: 0, proteins: 0, carbs: 0, fats: 0 }
      );

      if (!existing) {
        groupsMap.set(meal.date, {
          date: meal.date,
          meals: [meal],
          summary: { ...mealSummary },
        });
        continue;
      }

      existing.meals.push(meal);
      existing.summary.calories += mealSummary.calories;
      existing.summary.proteins += mealSummary.proteins;
      existing.summary.carbs += mealSummary.carbs;
      existing.summary.fats += mealSummary.fats;
    }

    return Array.from(groupsMap.values()).sort((a, b) =>
      a.date < b.date ? 1 : a.date > b.date ? -1 : 0
    );
  }, [meals]);

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right", "bottom"]}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View>
            <Text style={styles.eyebrow}>Food Follow</Text>
            <Text style={styles.heroTitle}>Mes repas</Text>
            <Text style={styles.heroSubtitle}>
              Suivi nutritionnel simple et quotidien
            </Text>
          </View>
          <View style={styles.heroIconWrap}>
            <Ionicons name="leaf" size={22} color={palette.primary} />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Historique par jour</Text>
          <Text style={styles.sectionCount}>{meals.length} repas</Text>
        </View>

        {groupedMeals.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons
              name="restaurant-outline"
              size={22}
              color={palette.textMuted}
            />
            <Text style={styles.emptyTitle}>Aucun repas enregistré</Text>
            <Text style={styles.emptySubtitle}>
              Ajoute ton premier repas avec le bouton +
            </Text>
          </View>
        ) : (
          groupedMeals.map((group) => (
            <View key={group.date} style={styles.dayGroupCard}>
              <View style={styles.dayHeader}>
                <View style={styles.dayTitleWrap}>
                  <View style={styles.dayIconWrap}>
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color={palette.primary}
                    />
                  </View>
                  <View>
                    <Text style={styles.dayLabel}>{formatDayLabel(group.date)}</Text>
                    <Text style={styles.dayDate}>{group.date}</Text>
                  </View>
                </View>

                <View style={styles.dayCountBadge}>
                  <Text style={styles.dayCountText}>{group.meals.length} repas</Text>
                </View>
              </View>

              <View style={styles.daySummaryRow}>
                <View style={[styles.summaryChip, styles.summaryChipGreen]}>
                  <Text style={styles.summaryLabel}>Kcal</Text>
                  <Text style={styles.summaryValue}>{Math.round(group.summary.calories)}</Text>
                </View>
                <View style={[styles.summaryChip, styles.summaryChipBlue]}>
                  <Text style={styles.summaryLabel}>Protéines</Text>
                  <Text style={styles.summaryValue}>{formatMacro(group.summary.proteins)} g</Text>
                </View>
                <View style={[styles.summaryChip, styles.summaryChipOrange]}>
                  <Text style={styles.summaryLabel}>Glucides</Text>
                  <Text style={styles.summaryValue}>{formatMacro(group.summary.carbs)} g</Text>
                </View>
                <View style={[styles.summaryChip, styles.summaryChipRed]}>
                  <Text style={styles.summaryLabel}>Lipides</Text>
                  <Text style={styles.summaryValue}>{formatMacro(group.summary.fats)} g</Text>
                </View>
              </View>

              <View style={styles.dayMealsList}>
                {group.meals.map((meal) => {
                  const visual = getMealVisual(meal.name);

                  return (
                    <Link
                      key={meal.id}
                      href={{
                        pathname: "/(main)/(home)/[id]",
                        params: { id: meal.id },
                      }}
                      asChild
                    >
                      <Pressable
                        style={({ pressed }) => [
                          styles.card,
                          {
                            backgroundColor: visual.soft,
                            borderColor: visual.border,
                          },
                          pressed && styles.pressed,
                        ]}
                      >
                        <View
                          style={[
                            styles.cardAccent,
                            { backgroundColor: visual.color },
                          ]}
                        />

                        <View style={styles.cardContent}>
                          <View style={styles.cardTopRow}>
                            <View style={styles.mealIdentity}>
                              <View
                                style={[
                                  styles.typeIconWrap,
                                  { backgroundColor: `${visual.color}22` },
                                ]}
                              >
                                <Ionicons
                                  name={visual.icon}
                                  size={18}
                                  color={visual.color}
                                />
                              </View>

                              <View>
                                <Text style={styles.mealName}>{meal.name}</Text>
                                <Text style={styles.mealSubtitle}>Repas du jour</Text>
                              </View>
                            </View>

                            <Ionicons
                              name="chevron-forward"
                              size={17}
                              color={palette.textMuted}
                            />
                          </View>

                          <View style={styles.cardDivider} />

                          <View style={styles.cardBottomRow}>
                            <View style={styles.kcalBadge}>
                              <Text style={[styles.kcalText, { color: visual.color }]}>
                                {getMealCalories(meal)} kcal
                              </Text>
                            </View>

                            <View style={styles.foodBadge}>
                              <Ionicons
                                name="nutrition-outline"
                                size={14}
                                color={palette.textMuted}
                              />
                              <Text style={styles.foodCount}>{meal.foods.length} aliments</Text>
                            </View>
                          </View>
                        </View>
                      </Pressable>
                    </Link>
                  );
                })}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Link href="/add" asChild>
        <Pressable
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        >
          <Ionicons name="add" size={30} color="#ffffff" />
        </Pressable>
      </Link>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 130,
    gap: 14,
  },
  heroCard: {
    backgroundColor: palette.surface,
    borderRadius: radius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: palette.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  eyebrow: {
    color: palette.primary,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  heroTitle: {
    marginTop: 2,
    color: palette.text,
    fontSize: 27,
    fontWeight: "800",
  },
  heroSubtitle: {
    marginTop: 2,
    color: palette.textMuted,
    fontSize: 13,
  },
  heroIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.backgroundMuted,
  },
  sectionHeader: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 17,
    fontWeight: "700",
  },
  sectionCount: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  emptyCard: {
    borderRadius: radius.lg,
    backgroundColor: palette.surfaceSoft,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 16,
    gap: 6,
    alignItems: "flex-start",
  },
  emptyTitle: {
    color: palette.text,
    fontSize: 15,
    fontWeight: "700",
  },
  emptySubtitle: {
    color: palette.textMuted,
    fontSize: 13,
  },
  dayGroupCard: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.xl,
    backgroundColor: palette.surface,
    padding: 12,
    gap: 10,
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  dayTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  dayIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.backgroundMuted,
  },
  dayLabel: {
    color: palette.text,
    fontWeight: "700",
    fontSize: 15,
  },
  dayDate: {
    color: palette.textMuted,
    fontSize: 12,
  },
  dayCountBadge: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.border,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: palette.surfaceSoft,
  },
  dayCountText: {
    color: palette.textMuted,
    fontSize: 11,
    fontWeight: "700",
  },
  daySummaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  summaryChip: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    minWidth: 74,
  },
  summaryChipGreen: {
    backgroundColor: "#eaf8ef",
    borderColor: "#b6e1c4",
  },
  summaryChipBlue: {
    backgroundColor: "#edf3ff",
    borderColor: "#c7d7ff",
  },
  summaryChipOrange: {
    backgroundColor: "#fff6e9",
    borderColor: "#f8dcb6",
  },
  summaryChipRed: {
    backgroundColor: "#ffefef",
    borderColor: "#f6c5c5",
  },
  summaryLabel: {
    fontSize: 10,
    color: palette.textMuted,
    fontWeight: "600",
  },
  summaryValue: {
    marginTop: 1,
    fontSize: 12,
    color: palette.text,
    fontWeight: "800",
  },
  dayMealsList: {
    gap: 8,
  },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: "hidden",
    flexDirection: "row",
    shadowColor: palette.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardAccent: {
    width: 6,
  },
  cardContent: {
    flex: 1,
    padding: 12,
    gap: 10,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  mealIdentity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  typeIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  mealName: {
    color: palette.text,
    fontSize: 17,
    fontWeight: "800",
  },
  mealSubtitle: {
    color: palette.textMuted,
    fontSize: 12,
    marginTop: 1,
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#00000014",
  },
  cardBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  kcalBadge: {
    borderRadius: radius.pill,
    backgroundColor: "#ffffffc0",
    borderWidth: 1,
    borderColor: "#00000012",
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  kcalText: {
    fontSize: 14,
    fontWeight: "800",
  },
  foodBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: radius.pill,
    backgroundColor: "#ffffff96",
    borderWidth: 1,
    borderColor: "#00000010",
    paddingVertical: 4,
    paddingHorizontal: 9,
  },
  foodCount: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 98,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: palette.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: palette.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  fabPressed: {
    backgroundColor: palette.primaryPressed,
    transform: [{ scale: 0.97 }],
  },
});
