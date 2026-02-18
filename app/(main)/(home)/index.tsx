import { useUser } from "@clerk/clerk-expo";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SignOutButton } from "../../components/sign-out-button";
import { FoodCard } from "../../components/food-card";
import { SearchSection } from "../../components/search-section";
import {
  getFoodByBarcode,
  searchFoodsByText,
  type FoodProduct,
} from "../../services/open-food-facts";
import { styles } from "./styles";
import { useCallback, useEffect, useRef, useState } from "react";

export default function Page() {
  const { user } = useUser();
  const [searchText, setSearchText] = useState("");
  const [barcode, setBarcode] = useState("");
  const [foods, setFoods] = useState<FoodProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const textSearchRequestId = useRef(0);

  const runTextSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setError(null);
      setFoods([]);
      setHasSearched(false);
      return;
    }

    const requestId = ++textSearchRequestId.current;
    setIsLoading(true);
    setError(null);

    try {
      const results = await searchFoodsByText(query, { pageSize: 10 });
      if (requestId !== textSearchRequestId.current) {
        return;
      }
      setFoods(results);
      setHasSearched(true);
    } catch {
      if (requestId !== textSearchRequestId.current) {
        return;
      }
      setError("La recherche a echoue. Reessaie dans quelques secondes.");
      setFoods([]);
      setHasSearched(false);
    } finally {
      if (requestId === textSearchRequestId.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const query = searchText.trim();
    const timeoutId = setTimeout(() => {
      void runTextSearch(query);
    }, 700);

    return () => {
      clearTimeout(timeoutId);
      textSearchRequestId.current += 1;
    };
  }, [searchText, runTextSearch]);

  const onBarcodeSearch = useCallback(async () => {
    const cleanedBarcode = barcode.trim();
    textSearchRequestId.current += 1;

    if (!cleanedBarcode) {
      setError("Entre un code-barres.");
      setFoods([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getFoodByBarcode(cleanedBarcode);
      if (!result) {
        setFoods([]);
        setError("Produit introuvable pour ce code-barres.");
        setHasSearched(true);
        return;
      }

      setFoods([result]);
      setHasSearched(true);
    } catch {
      setError("La recherche par code-barres a echoue.");
      setFoods([]);
      setHasSearched(false);
    } finally {
      setIsLoading(false);
    }
  }, [barcode]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Food Follow</Text>
            <Text style={styles.subtitle}>
              Bonjour {user?.emailAddresses[0]?.emailAddress}
            </Text>
          </View>
          <SignOutButton />
        </View>

        <SearchSection
          title="Recherche texte"
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Ex: coca cola"
          hint="Recherche automatique avec debounce."
          onSearch={() => void runTextSearch(searchText.trim())}
          loading={isLoading}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <SearchSection
          title="Recherche code-barres"
          value={barcode}
          onChangeText={setBarcode}
          placeholder="Ex: 3274080005003"
          onSearch={onBarcodeSearch}
          loading={isLoading}
          keyboardType="number-pad"
        />

        <View style={styles.statusContainer}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#0a7ea4" />
          ) : null}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {hasSearched && !isLoading && !error && foods.length === 0 ? (
            <Text style={styles.emptyText}>Aucun produit trouve.</Text>
          ) : null}
        </View>

        {foods.map((food) => (
          <FoodCard key={`${food.code}-${food.name}`} food={food} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
