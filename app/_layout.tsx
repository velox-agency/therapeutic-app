import { Inter_400Regular, Inter_700Bold } from "@expo-google-fonts/inter";
import {
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import "react-native-reanimated";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider, useAuth } from "@/hooks/useAuth";

export const unstable_settings = {
  anchor: "(tabs)",
};

function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={Colors.primary[500]} />
    </View>
  );
}

function RootLayoutNav() {
  const { user, profile, loading, initialized } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inParentGroup = segments[0] === "(parent)";
    const inTherapistGroup = segments[0] === "(therapist)";

    if (!user) {
      // Not logged in, redirect to auth
      if (!inAuthGroup) {
        router.replace("/(auth)/login");
      }
    } else if (profile) {
      // User is logged in with a profile
      if (inAuthGroup) {
        // Redirect based on role
        if (profile.role === "therapist") {
          router.replace("/(therapist)/dashboard");
        } else {
          router.replace("/(parent)/dashboard");
        }
      } else if (profile.role === "therapist" && inParentGroup) {
        // Therapist trying to access parent routes
        router.replace("/(therapist)/dashboard");
      } else if (profile.role === "parent" && inTherapistGroup) {
        // Parent trying to access therapist routes
        router.replace("/(parent)/dashboard");
      }
    } else if (user && !loading) {
      // User exists but no profile yet - might still be loading
      // Wait a bit for the profile to be created by the trigger
      const timer = setTimeout(() => {
        if (!profile) {
          // Still no profile, might be an issue - go to parent dashboard by default
          if (inAuthGroup) {
            router.replace("/(parent)/dashboard");
          }
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, profile, loading, initialized, segments]);

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(parent)" options={{ headerShown: false }} />
      <Stack.Screen name="(therapist)" options={{ headerShown: false }} />
      <Stack.Screen name="shared" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="modal"
        options={{ presentation: "modal", title: "Modal" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
    Inter_400Regular,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <RootLayoutNav />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
});
