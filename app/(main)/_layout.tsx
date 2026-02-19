import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { palette } from "../theme";
import { MealsProvider } from "../state/meals-context";

export default function AuthRoutesLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <MealsProvider>
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: palette.primary,
          tabBarInactiveTintColor: "#8ba094",
          tabBarStyle: {
            position: "absolute",
            left: 14,
            right: 14,
            bottom: 14,
            height: 64,
            borderRadius: 18,
            borderTopWidth: 0,
            backgroundColor: palette.surface,
            paddingBottom: 8,
            paddingTop: 8,
            shadowColor: palette.shadow,
            shadowOpacity: 0.15,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 5 },
            elevation: 7,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "700",
          },
          tabBarIcon: ({ color, size, focused }) => {
            if (route.name === "(home)") {
              return (
                <Ionicons
                  name={focused ? "restaurant" : "restaurant-outline"}
                  size={size}
                  color={color}
                />
              );
            }

            if (route.name === "add") {
              return (
                <Ionicons
                  name={focused ? "add-circle" : "add-circle-outline"}
                  size={size}
                  color={color}
                />
              );
            }

            return (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={size}
                color={color}
              />
            );
          },
        })}
      >
        <Tabs.Screen name="(home)" options={{ title: "Repas" }} />
        <Tabs.Screen name="add" options={{ title: "Ajouter" }} />
        <Tabs.Screen name="profile" options={{ title: "Profil" }} />
      </Tabs>
    </MealsProvider>
  );
}
