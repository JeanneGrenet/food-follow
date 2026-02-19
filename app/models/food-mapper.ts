import { type Food } from "./meal";
import { type FoodProduct } from "../services/open-food-facts";

export const mapFoodProductToFood = (product: FoodProduct): Food => {
  const fallbackId = `${Date.now()}-${Math.random()}`;

  return {
    id: product.code || fallbackId,
    name: product.name,
    brand: product.brand ?? "",
    image_url: product.imageUrl ?? "",
    nutriscore: (product.nutriScoreGrade ?? "").toLowerCase(),
    calories: product.nutriments.energyKcal100g ?? 0,
    proteins: product.nutriments.proteins100g ?? 0,
    carbs: product.nutriments.carbohydrates100g ?? 0,
    fats: product.nutriments.fat100g ?? 0,
  };
};
