export type Food = {
  id: string;
  name: string;
  brand: string;
  image_url: string;
  nutriscore: string;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
};

export type Meal = {
  id: string;
  name: string;
  date: string;
  foods: Food[];
};

export const getMealCalories = (meal: Meal) => {
  return meal.foods.reduce((total, food) => total + food.calories, 0);
};
