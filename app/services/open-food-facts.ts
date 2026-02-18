import { Platform } from "react-native";

export type FoodProduct = {
  code: string;
  name: string;
  brand: string | null;
  imageUrl: string | null;
  nutriScoreGrade: string | null;
  nutriments: {
    energyKcal100g: number | null;
    proteins100g: number | null;
    carbohydrates100g: number | null;
    fat100g: number | null;
  };
};

type OpenFoodFactsProduct = {
  code?: string;
  product_name?: string;
  product_name_fr?: string;
  product_name_en?: string;
  brands?: string;
  image_url?: string;
  nutriscore_grade?: string;
  nutriments?: Record<string, unknown>;
};

const BASE_URL = "https://fr.openfoodfacts.org";

const COMMON_FIELDS = [
  "code",
  "product_name",
  "product_name_fr",
  "product_name_en",
  "brands",
  "nutriments",
  "image_url",
  "nutriscore_grade",
].join(",");

const getFirstNonEmptyName = (product: OpenFoodFactsProduct) => {
  const names = [
    product.product_name,
    product.product_name_fr,
    product.product_name_en,
  ];

  return names.find((name) => typeof name === "string" && name.trim().length > 0);
};

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : null;
  }

  return null;
};

const normalizeProduct = (product: OpenFoodFactsProduct): FoodProduct => {
  const nutriments = product.nutriments ?? {};
  const fallbackName = `Produit ${product.code ?? "inconnu"}`;
  const displayName = getFirstNonEmptyName(product)?.trim() ?? fallbackName;

  return {
    code: product.code ?? "",
    name: displayName,
    brand: typeof product.brands === "string" ? product.brands : null,
    imageUrl: typeof product.image_url === "string" ? product.image_url : null,
    nutriScoreGrade:
      typeof product.nutriscore_grade === "string"
        ? product.nutriscore_grade.toUpperCase()
        : null,
    nutriments: {
      energyKcal100g: toNumber(nutriments["energy-kcal_100g"]),
      proteins100g: toNumber(nutriments.proteins_100g),
      carbohydrates100g: toNumber(nutriments.carbohydrates_100g),
      fat100g: toNumber(nutriments.fat_100g),
    },
  };
};

const buildRequestHeaders = () => {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (Platform.OS !== "web") {
    headers["User-Agent"] = "FoodFollow/1.0 (mobile app)";
  }

  return headers;
};

export const searchFoodsByText = async (
  searchTerms: string,
  options?: { pageSize?: number }
) => {
  const query = searchTerms.trim();

  if (!query) {
    return [] as FoodProduct[];
  }

  const url = new URL(`${BASE_URL}/cgi/search.pl`);
  url.searchParams.set("search_terms", query);
  url.searchParams.set("search_simple", "1");
  url.searchParams.set("action", "process");
  url.searchParams.set("json", "1");
  url.searchParams.set("fields", COMMON_FIELDS);
  url.searchParams.set("page_size", String(options?.pageSize ?? 10));

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: buildRequestHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Search request failed (${response.status})`);
  }

  const payload = (await response.json()) as { products?: OpenFoodFactsProduct[] };
  return (payload.products ?? []).map(normalizeProduct);
};

export const getFoodByBarcode = async (barcode: string) => {
  const normalizedBarcode = barcode.trim();
  if (!normalizedBarcode) {
    return null;
  }

  const url = new URL(`${BASE_URL}/api/v2/product/${normalizedBarcode}.json`);
  url.searchParams.set("fields", COMMON_FIELDS);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: buildRequestHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Barcode request failed (${response.status})`);
  }

  const payload = (await response.json()) as {
    status?: number;
    product?: OpenFoodFactsProduct;
  };

  if (payload.status !== 1 || !payload.product) {
    return null;
  }

  return normalizeProduct(payload.product);
};
