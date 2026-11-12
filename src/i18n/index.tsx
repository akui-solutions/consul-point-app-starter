import { createContext, useContext, type ReactNode } from 'react';

export type Locale = 'es' | 'en';

export const toLocale = (language: string): Locale => (language === 'en' ? 'en' : 'es');

const LocaleContext = createContext<Locale>('es');

interface LocaleProviderProps {
  locale: Locale;
  children: ReactNode;
}

export function LocaleProvider({ locale, children }: LocaleProviderProps) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

export function createTranslationHook<T extends Record<string, unknown>>(translations: Record<Locale, T>) {
  return function useTranslation(): T {
    return translations[useLocale()];
  };
}
