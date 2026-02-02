import { Colors } from "@/constants/theme";
import { Stack } from "expo-router";

export default function SharedLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="goals" />
      <Stack.Screen name="resources" />
    </Stack>
  );
}
