import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { MEALS } from "../data/meals";
import { type Food, type Meal } from "../models/meal";

type MealsContextValue = {
  meals: Meal[];
  addMeal: (meal: Meal) => void;
  addFoodToMeal: (mealId: string, food: Food) => void;
  removeMeal: (mealId: string) => void;
};

const MealsContext = createContext<MealsContextValue | null>(null);

export const MealsProvider = ({ children }: { children: ReactNode }) => {
  const [meals, setMeals] = useState<Meal[]>(MEALS);

  const addMeal = (meal: Meal) => {
    setMeals((prev) => [meal, ...prev]);
  };

  const addFoodToMeal = (mealId: string, food: Food) => {
    setMeals((prev) =>
      prev.map((meal) =>
        meal.id === mealId ? { ...meal, foods: [...meal.foods, food] } : meal
      )
    );
  };

  const removeMeal = (mealId: string) => {
    setMeals((prev) => prev.filter((meal) => meal.id !== mealId));
  };

  const value = useMemo(
    () => ({ meals, addMeal, addFoodToMeal, removeMeal }),
    [meals]
  );

  return <MealsContext.Provider value={value}>{children}</MealsContext.Provider>;
};

export const useMeals = () => {
  const context = useContext(MealsContext);

  if (!context) {
    throw new Error("useMeals must be used inside MealsProvider");
  }

  return context;
};
