/**
 * Data transformation utilities
 * Converts API responses to UI-friendly formats
 */

import { Term, Translation, Locale } from './api';

export interface UITerm {
  id: string;
  key: string;
  translations: Record<string, string>;
  labels: string[];
}

export interface UILocale {
  code: string;
  name: string;
  isBase: boolean;
  translatedCount: number;
  totalCount: number;
}

/**
 * Transform API terms and translations into UI format
 */
export function transformTermsForUI(
  terms: Term[],
  translations: Record<string, Translation[]>
): UITerm[] {
  return terms.map((term) => {
    const termTranslations: Record<string, string> = {};
    
    // Map translations by locale code
    Object.entries(translations).forEach(([localeCode, localeTranslations]) => {
      const translation = localeTranslations.find((t) => t.termId === term.id);
      if (translation) {
        termTranslations[localeCode] = translation.value;
      }
    });

    return {
      id: term.id,
      key: term.value, // Term value is the key in Traduora
      translations: termTranslations,
      labels: term.labels.map((l) => l.name),
    };
  });
}

/**
 * Transform API locales into UI format
 */
export function transformLocalesForUI(
  locales: Locale[],
  termsCount: number,
  translations: Record<string, Translation[]>
): UILocale[] {
  return locales.map((locale, index) => {
    const localeCode = locale.locale.code;
    const localeTranslations = translations[localeCode] || [];
    const translatedCount = localeTranslations.filter((t) => t.value && t.value.trim() !== '').length;

    return {
      code: localeCode,
      name: locale.locale.language || localeCode.toUpperCase(),
      isBase: index === 0, // First locale is base
      translatedCount,
      totalCount: termsCount,
    };
  });
}

/**
 * Get locale flag emoji
 */
export function getLocaleFlag(locale: string): string {
  const flags: Record<string, string> = {
    en: "🇺🇸",
    vi: "🇻🇳",
    es: "🇪🇸",
    fr: "🇫🇷",
    de: "🇩🇪",
    pt: "🇵🇹",
    ja: "🇯🇵",
    zh: "🇨🇳",
  };
  return flags[locale.toLowerCase()] || "🌐";
}

