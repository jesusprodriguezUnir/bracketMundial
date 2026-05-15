import { createStore } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';
import { es, type TranslationKey } from './es';
import { en } from './en';

export type Locale = 'es' | 'en';

const dictionaries: Record<Locale, Record<TranslationKey, string>> = { es, en };

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = createStore<LocaleState>()(
  persist(
    (set) => ({
      locale: 'es',
      setLocale: (locale) => {
        set({ locale });
        document.documentElement.lang = locale;
      },
    }),
    { name: 'bm-locale' }
  )
);

export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  const locale = useLocaleStore.getState().locale;
  let str = dictionaries[locale][key] ?? (dictionaries.es[key] as string) ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.replaceAll(`{${k}}`, String(v));
    }
  }
  return str;
}

export function toggleLocale(): void {
  const current = useLocaleStore.getState().locale;
  useLocaleStore.getState().setLocale(current === 'es' ? 'en' : 'es');
}
