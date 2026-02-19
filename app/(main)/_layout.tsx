import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Tabs } from "expo-router";
import { MealsProvider } from "../state/meals-context";
export default function AuthRoutesLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href={"/sign-in"} />;
  }

  return (
    <MealsProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#45b457",
        }}
      >
        <Tabs.Screen name="(home)" options={{ title: "Repas" }} />
        <Tabs.Screen name="add" options={{ title: "Ajouter" }} />
        <Tabs.Screen name="profile" options={{ title: "Profil" }} />
      </Tabs>
    </MealsProvider>
  );
}
