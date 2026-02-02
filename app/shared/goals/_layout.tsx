import { Colors } from "@/constants/theme";
import { Stack } from "expo-router";

export default function GoalsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="create" />
      <Stack.Screen name="daily-log" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
