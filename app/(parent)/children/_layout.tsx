import { Colors } from "@/constants/theme";
import { Stack } from "expo-router";

export default function ChildrenLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="add" options={{ presentation: "modal" }} />
    </Stack>
  );
}
