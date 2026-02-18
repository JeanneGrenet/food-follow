import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MEALS } from "../../data/meals";
import { getMealCalories } from "../../models/meal";

export default function HomePage() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes repas</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {MEALS.map((meal) => (
          <Link
            key={meal.id}
            href={{ pathname: "/(main)/(home)/[id]", params: { id: meal.id } }}
            asChild
          >
            <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
              <View style={styles.cardRow}>
                <View>
                  <Text style={styles.mealName}>{meal.name}</Text>
                  <Text style={styles.mealDate}>{meal.date}</Text>
                </View>
                <View style={styles.rightInfos}>
                  <Text style={styles.mealCalories}>{getMealCalories(meal)} kcal</Text>
                  <Text style={styles.foodCount}>{meal.foods.length} aliments</Text>
                </View>
              </View>
            </Pressable>
          </Link>
        ))}
      </ScrollView>

      <Link href="/add" asChild>
        <Pressable style={({ pressed }) => [styles.fab, pressed && styles.pressed]}>
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      </Link>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f2f4f7",
  },
  header: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  container: {
    padding: 20,
    gap: 12,
    paddingBottom: 90,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pressed: {
    opacity: 0.8,
  },
  mealName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  mealDate: {
    color: "#6b7280",
    marginTop: 2,
  },
  rightInfos: {
    alignItems: "flex-end",
    gap: 2,
  },
  mealCalories: {
    color: "#22a55a",
    fontWeight: "700",
    fontSize: 16,
  },
  foodCount: {
    color: "#9ca3af",
    fontSize: 12,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#45b457",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  fabText: {
    color: "#ffffff",
    fontSize: 28,
    lineHeight: 28,
    fontWeight: "600",
  },
});
