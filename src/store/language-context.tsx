"use client";

import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { IntlProvider } from "react-intl";

// Import message files
import enMessages from "../../messages/en.json";
import kkMessages from "../../messages/kk.json";
import ruMessages from "../../messages/ru.json";

type Language = "RU" | "EN" | "KK";

interface LanguageContextType {
  currentLanguage: Language;
  setCurrentLanguage: (lang: Language) => void;
  changeLanguage: (lang: Language) => void;
  languages: Array<{
    code: Language;
    label: string;
    flag: string;
  }>;
  messages: Record<string, any>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

// Inner component that has access to react-intl hooks
const LanguageProviderInner: React.FC<
  PropsWithChildren<{
    currentLanguage: Language;
    setCurrentLanguage: (lang: Language) => void;
  }>
> = ({ children, currentLanguage, setCurrentLanguage }) => {
  const languages: Array<{ code: Language; label: string; flag: string }> =
    useMemo(
      () => [
        { code: "RU", label: "Русский", flag: "🇷🇺" },
        { code: "EN", label: "English", flag: "🇬🇧" },
        { code: "KK", label: "Қазақша", flag: "🇰🇿" },
      ],
      []
    );

  const changeLanguage = useCallback(
    (lang: Language) => {
      setCurrentLanguage(lang);
      // You can add additional logic here like saving to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, lang);
      }
    },
    [setCurrentLanguage]
  );

  const messages = useMemo(() => {
    switch (currentLanguage) {
      case "EN":
        return enMessages;
      case "KK":
        return kkMessages;
      case "RU":
      default:
        return ruMessages;
    }
  }, [currentLanguage]);

  const contextValue = useMemo(
    () => ({
      currentLanguage,
      setCurrentLanguage,
      changeLanguage,
      languages,
      messages,
    }),
    [currentLanguage, setCurrentLanguage, changeLanguage, languages, messages]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

const STORAGE_KEY = "preferred-language";

export const LanguageProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    // Initialize from localStorage if available
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY) as Language;
      if (saved && ["RU", "EN", "KK"].includes(saved)) {
        return saved;
      }
    }
    return "RU";
  });

  const messages = useMemo(() => {
    switch (currentLanguage) {
      case "EN":
        return enMessages;
      case "KK":
        return kkMessages;
      case "RU":
      default:
        return ruMessages;
    }
  }, [currentLanguage]);

  const locale = useMemo(() => {
    switch (currentLanguage) {
      case "EN":
        return "en";
      case "KK":
        return "kk";
      case "RU":
      default:
        return "ru";
    }
  }, [currentLanguage]);

  return (
    <IntlProvider locale={locale} messages={messages} onError={() => null}>
      <LanguageProviderInner
        currentLanguage={currentLanguage}
        setCurrentLanguage={setCurrentLanguage}
      >
        {children}
      </LanguageProviderInner>
    </IntlProvider>
  );
};
