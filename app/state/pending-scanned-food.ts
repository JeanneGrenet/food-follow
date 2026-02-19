import { type Food } from "../models/meal";

let pendingScannedFood: Food | null = null;

export const setPendingScannedFood = (food: Food) => {
  pendingScannedFood = food;
};

export const consumePendingScannedFood = () => {
  const food = pendingScannedFood;
  pendingScannedFood = null;
  return food;
};
