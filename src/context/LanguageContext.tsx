import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import { changeLanguage as changeI18nLanguage } from "../i18n";

type Language = "en" | "ko";

interface LanguageContextType {
  language: Language;
  changeLanguage: (lang: Language) => Promise<void>;
  t: (key: string, options?: any) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { i18n, t } = useTranslation();
  const [language, setLanguage] = useState<Language>(
    (i18n.language as Language) || "en"
  );

  useEffect(() => {
    setLanguage((i18n.language as Language) || "en");
  }, [i18n.language]);

  const changeLanguage = async (lang: Language) => {
    await changeI18nLanguage(lang);
    setLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};
