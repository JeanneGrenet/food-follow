import { Image, StyleSheet, Text, View } from "react-native";
import type { FoodProduct } from "../services/open-food-facts";

const formatValue = (value: number | null, unit: string) => {
  if (value === null) {
    return "-";
  }

  const rounded = Math.round(value * 10) / 10;
  return `${rounded} ${unit}`;
};

export const FoodCard = ({ food }: { food: FoodProduct }) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderText}>
          <Text style={styles.foodName}>{food.name}</Text>
          <Text style={styles.foodBrand}>{food.brand ?? "Marque inconnue"}</Text>
          <Text style={styles.foodCode}>Code: {food.code || "N/A"}</Text>
        </View>
        {food.imageUrl ? (
          <Image source={{ uri: food.imageUrl }} style={styles.foodImage} />
        ) : null}
      </View>

      <View style={styles.metricsRow}>
        <Text style={styles.metricLabel}>Nutri-Score:</Text>
        <Text style={styles.metricValue}>{food.nutriScoreGrade ?? "-"}</Text>
      </View>
      <View style={styles.metricsRow}>
        <Text style={styles.metricLabel}>Calories (100g):</Text>
        <Text style={styles.metricValue}>
          {formatValue(food.nutriments.energyKcal100g, "kcal")}
        </Text>
      </View>
      <View style={styles.metricsRow}>
        <Text style={styles.metricLabel}>Proteines (100g):</Text>
        <Text style={styles.metricValue}>
          {formatValue(food.nutriments.proteins100g, "g")}
        </Text>
      </View>
      <View style={styles.metricsRow}>
        <Text style={styles.metricLabel}>Glucides (100g):</Text>
        <Text style={styles.metricValue}>
          {formatValue(food.nutriments.carbohydrates100g, "g")}
        </Text>
      </View>
      <View style={styles.metricsRow}>
        <Text style={styles.metricLabel}>Lipides (100g):</Text>
        <Text style={styles.metricValue}>
          {formatValue(food.nutriments.fat100g, "g")}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    borderRadius: 12,
    backgroundColor: "#fdfdfd",
    gap: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  cardHeaderText: {
    flexShrink: 1,
    gap: 3,
  },
  foodName: {
    fontSize: 16,
    fontWeight: "700",
  },
  foodBrand: {
    fontSize: 14,
    color: "#444444",
  },
  foodCode: {
    fontSize: 12,
    color: "#606060",
  },
  foodImage: {
    width: 74,
    height: 74,
    borderRadius: 8,
    backgroundColor: "#efefef",
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  metricLabel: {
    color: "#343434",
    fontSize: 13,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: "600",
  },
});
