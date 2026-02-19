import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { type Food, type Meal } from "../models/meal";

type MealsContextValue = {
  meals: Meal[];
  addMeal: (meal: Meal) => void;
  addFoodToMeal: (mealId: string, food: Food) => void;
  removeMeal: (mealId: string) => void;
};

const MealsContext = createContext<MealsContextValue | null>(null);
const MEALS_STORAGE_KEY = "@food-follow/meals";

export const MealsProvider = ({ children }: { children: ReactNode }) => {
  const [meals, setMeals] = useState<Meal[]>([]);

  const persistMeals = async (nextMeals: Meal[]) => {
    try {
      if (nextMeals.length === 0) {
        await AsyncStorage.removeItem(MEALS_STORAGE_KEY);
        return;
      }

      await AsyncStorage.setItem(MEALS_STORAGE_KEY, JSON.stringify(nextMeals));
    } catch (error) {
      console.error("Failed to save meals to storage", error);
    }
  };

  const updateMeals = (updater: (prev: Meal[]) => Meal[]) => {
    setMeals((prev) => {
      const nextMeals = updater(prev);
      void persistMeals(nextMeals);
      return nextMeals;
    });
  };

  useEffect(() => {
    let isMounted = true;

    const loadMeals = async () => {
      try {
        const storedMeals = await AsyncStorage.getItem(MEALS_STORAGE_KEY);

        if (!storedMeals) {
          return;
        }

        const parsedMeals = JSON.parse(storedMeals) as Meal[];
        if (Array.isArray(parsedMeals) && isMounted) {
          setMeals(parsedMeals);
        }
      } catch (error) {
        console.error("Failed to load meals from storage", error);
      }
    };

    void loadMeals();

    return () => {
      isMounted = false;
    };
  }, []);

  const addMeal = (meal: Meal) => {
    updateMeals((prev) => [meal, ...prev]);
  };

  const addFoodToMeal = (mealId: string, food: Food) => {
    updateMeals((prev) =>
      prev.map((meal) =>
        meal.id === mealId ? { ...meal, foods: [...meal.foods, food] } : meal
      )
    );
  };

  const removeMeal = (mealId: string) => {
    updateMeals((prev) => prev.filter((meal) => meal.id !== mealId));
  };

  const value = useMemo(
    () => ({ meals, addMeal, addFoodToMeal, removeMeal }),
    [meals]
  );

  return (
    <MealsContext.Provider value={value}>{children}</MealsContext.Provider>
  );
};

export const useMeals = () => {
  const context = useContext(MealsContext);

  if (!context) {
    throw new Error("useMeals must be used inside MealsProvider");
  }

  return context;
};
