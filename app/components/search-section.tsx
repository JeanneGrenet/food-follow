import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { TextInputProps } from "react-native";

type SearchSectionProps = {
  title: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  onSearch: () => void;
  loading: boolean;
  hint?: string;
  keyboardType?: TextInputProps["keyboardType"];
  autoCapitalize?: TextInputProps["autoCapitalize"];
  autoCorrect?: boolean;
};

export const SearchSection = ({
  title,
  value,
  onChangeText,
  placeholder,
  onSearch,
  loading,
  hint,
  keyboardType,
  autoCapitalize,
  autoCorrect,
}: SearchSectionProps) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#666666"
        style={styles.input}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
          loading && styles.buttonDisabled,
        ]}
        disabled={loading}
        onPress={onSearch}
      >
        <Text style={styles.buttonText}>{loading ? "Recherche..." : "Rechercher"}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    padding: 14,
    borderWidth: 1,
    borderColor: "#e3e3e3",
    borderRadius: 12,
    gap: 10,
    backgroundColor: "#ffffff",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  input: {
    borderWidth: 1,
    borderColor: "#cfcfcf",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: "#fafafa",
  },
  hint: {
    color: "#5c5c5c",
    fontSize: 12,
  },
  button: {
    backgroundColor: "#0a7ea4",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  buttonPressed: {
    opacity: 0.75,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
  },
});
