import { type Meal } from "../models/meal";

export const MEALS: Meal[] = [
  {
    id: "meal-1",
    name: "Petit-dejeuner",
    date: "2026-02-18",
    foods: [
      {
        id: "3274080005003",
        name: "Nutella",
        brand: "Ferrero",
        image_url: "",
        nutriscore: "e",
        calories: 539,
        proteins: 6.3,
        carbs: 57.5,
        fats: 30.9,
      },
    ],
  },
  {
    id: "meal-2",
    name: "Dejeuner",
    date: "2026-02-18",
    foods: [
      {
        id: "3017620422003",
        name: "Pate a tartiner",
        brand: "Ferrero",
        image_url: "",
        nutriscore: "e",
        calories: 530,
        proteins: 6,
        carbs: 56,
        fats: 31,
      },
    ],
  },
];
