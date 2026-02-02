import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import { I18n } from "i18n-js";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { I18nManager } from "react-native";

import ar from "@/locales/ar.json";
import en from "@/locales/en.json";
import fr from "@/locales/fr.json";

export type SupportedLanguage = "en" | "ar" | "fr";

const translations = {
  en,
  ar,
  fr,
};

const i18n = new I18n(translations);
i18n.enableFallback = true;
i18n.defaultLocale = "en";

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
  t: (key: string, params?: Record<string, any>) => string;
  isRTL: boolean;
  availableLanguages: {
    code: SupportedLanguage;
    name: string;
    nativeName: string;
  }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

const STORAGE_KEY = "@therapeutic_language";

const AVAILABLE_LANGUAGES: {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
}[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "fr", name: "French", nativeName: "Français" },
];

// Get system language and map to supported language
function getSystemLanguage(): SupportedLanguage {
  const systemLocale = Localization.getLocales()[0]?.languageCode ?? "en";

  if (systemLocale === "ar") return "ar";
  if (systemLocale === "fr") return "fr";
  return "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>("en");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved language preference
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedLanguage && ["en", "ar", "fr"].includes(savedLanguage)) {
          setLanguageState(savedLanguage as SupportedLanguage);
          i18n.locale = savedLanguage;
        } else {
          // Use system language as default
          const systemLang = getSystemLanguage();
          setLanguageState(systemLang);
          i18n.locale = systemLang;
        }
      } catch (error) {
        console.error("Failed to load language:", error);
        i18n.locale = "en";
      } finally {
        setIsLoaded(true);
      }
    };
    loadLanguage();
  }, []);

  const setLanguage = useCallback(async (lang: SupportedLanguage) => {
    try {
      // Update state and i18n
      setLanguageState(lang);
      i18n.locale = lang;

      // Save preference
      await AsyncStorage.setItem(STORAGE_KEY, lang);

      // Handle RTL for Arabic
      const isRTL = lang === "ar";
      if (I18nManager.isRTL !== isRTL) {
        I18nManager.allowRTL(isRTL);
        I18nManager.forceRTL(isRTL);
        // Note: App restart may be required for RTL changes to take full effect
      }
    } catch (error) {
      console.error("Failed to set language:", error);
    }
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, any>) => {
      return i18n.t(key, params);
    },
    [language],
  ); // Re-create when language changes

  const isRTL = language === "ar";

  if (!isLoaded) {
    return null; // Or a loading component
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isRTL,
        availableLanguages: AVAILABLE_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

// Simple translation function for use outside of React components
export function translate(key: string, params?: Record<string, any>) {
  return i18n.t(key, params);
}
