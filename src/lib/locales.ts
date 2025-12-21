/**
 * Predefined locale codes
 * Format: language_REGION (e.g., en_US, de_DE)
 */

export interface LocaleDefinition {
  code: string;
  language: string;
  region: string;
  displayName: string;
}

export const SUPPORTED_LOCALES: LocaleDefinition[] = [
  // English variants
  { code: 'en_US', language: 'English', region: 'United States', displayName: 'English (US)' },
  { code: 'en_GB', language: 'English', region: 'United Kingdom', displayName: 'English (UK)' },
  { code: 'en_CA', language: 'English', region: 'Canada', displayName: 'English (Canada)' },
  { code: 'en_AU', language: 'English', region: 'Australia', displayName: 'English (Australia)' },
  
  // Spanish variants
  { code: 'es_ES', language: 'Spanish', region: 'Spain', displayName: 'Español (España)' },
  { code: 'es_MX', language: 'Spanish', region: 'Mexico', displayName: 'Español (México)' },
  { code: 'es_AR', language: 'Spanish', region: 'Argentina', displayName: 'Español (Argentina)' },
  
  // German variants
  { code: 'de_DE', language: 'German', region: 'Germany', displayName: 'Deutsch (Deutschland)' },
  { code: 'de_AT', language: 'German', region: 'Austria', displayName: 'Deutsch (Österreich)' },
  { code: 'de_CH', language: 'German', region: 'Switzerland', displayName: 'Deutsch (Schweiz)' },
  
  // French variants
  { code: 'fr_FR', language: 'French', region: 'France', displayName: 'Français (France)' },
  { code: 'fr_CA', language: 'French', region: 'Canada', displayName: 'Français (Canada)' },
  { code: 'fr_BE', language: 'French', region: 'Belgium', displayName: 'Français (Belgique)' },
  { code: 'fr_CH', language: 'French', region: 'Switzerland', displayName: 'Français (Suisse)' },
  
  // Italian
  { code: 'it_IT', language: 'Italian', region: 'Italy', displayName: 'Italiano (Italia)' },
  
  // Portuguese variants
  { code: 'pt_BR', language: 'Portuguese', region: 'Brazil', displayName: 'Português (Brasil)' },
  { code: 'pt_PT', language: 'Portuguese', region: 'Portugal', displayName: 'Português (Portugal)' },
  
  // Dutch
  { code: 'nl_NL', language: 'Dutch', region: 'Netherlands', displayName: 'Nederlands (Nederland)' },
  { code: 'nl_BE', language: 'Dutch', region: 'Belgium', displayName: 'Nederlands (België)' },
  
  // Polish
  { code: 'pl_PL', language: 'Polish', region: 'Poland', displayName: 'Polski (Polska)' },
  
  // Russian
  { code: 'ru_RU', language: 'Russian', region: 'Russia', displayName: 'Русский (Россия)' },
  
  // Japanese
  { code: 'ja_JP', language: 'Japanese', region: 'Japan', displayName: '日本語 (日本)' },
  
  // Chinese variants
  { code: 'zh_CN', language: 'Chinese', region: 'China', displayName: '中文 (简体)' },
  { code: 'zh_TW', language: 'Chinese', region: 'Taiwan', displayName: '中文 (繁體)' },
  { code: 'zh_HK', language: 'Chinese', region: 'Hong Kong', displayName: '中文 (香港)' },
  
  // Korean
  { code: 'ko_KR', language: 'Korean', region: 'South Korea', displayName: '한국어 (대한민국)' },
  
  // Arabic
  { code: 'ar_SA', language: 'Arabic', region: 'Saudi Arabia', displayName: 'العربية (السعودية)' },
  { code: 'ar_EG', language: 'Arabic', region: 'Egypt', displayName: 'العربية (مصر)' },
  
  // Hindi
  { code: 'hi_IN', language: 'Hindi', region: 'India', displayName: 'हिन्दी (भारत)' },
  
  // Turkish
  { code: 'tr_TR', language: 'Turkish', region: 'Turkey', displayName: 'Türkçe (Türkiye)' },
  
  // Swedish
  { code: 'sv_SE', language: 'Swedish', region: 'Sweden', displayName: 'Svenska (Sverige)' },
  
  // Norwegian
  { code: 'no_NO', language: 'Norwegian', region: 'Norway', displayName: 'Norsk (Norge)' },
  
  // Danish
  { code: 'da_DK', language: 'Danish', region: 'Denmark', displayName: 'Dansk (Danmark)' },
  
  // Finnish
  { code: 'fi_FI', language: 'Finnish', region: 'Finland', displayName: 'Suomi (Suomi)' },
  
  // Greek
  { code: 'el_GR', language: 'Greek', region: 'Greece', displayName: 'Ελληνικά (Ελλάδα)' },
  
  // Czech
  { code: 'cs_CZ', language: 'Czech', region: 'Czech Republic', displayName: 'Čeština (Česko)' },
  
  // Hungarian
  { code: 'hu_HU', language: 'Hungarian', region: 'Hungary', displayName: 'Magyar (Magyarország)' },
  
  // Romanian
  { code: 'ro_RO', language: 'Romanian', region: 'Romania', displayName: 'Română (România)' },
  
  // Thai
  { code: 'th_TH', language: 'Thai', region: 'Thailand', displayName: 'ไทย (ประเทศไทย)' },
  
  // Vietnamese
  { code: 'vi_VN', language: 'Vietnamese', region: 'Vietnam', displayName: 'Tiếng Việt (Việt Nam)' },
  
  // Indonesian
  { code: 'id_ID', language: 'Indonesian', region: 'Indonesia', displayName: 'Bahasa Indonesia (Indonesia)' },
  
  // Malay
  { code: 'ms_MY', language: 'Malay', region: 'Malaysia', displayName: 'Bahasa Melayu (Malaysia)' },
  
  // Ukrainian
  { code: 'uk_UA', language: 'Ukrainian', region: 'Ukraine', displayName: 'Українська (Україна)' },
  
  // Hebrew
  { code: 'he_IL', language: 'Hebrew', region: 'Israel', displayName: 'עברית (ישראל)' },
];

/**
 * Check if a locale code is supported
 */
export function isValidLocaleCode(code: string): boolean {
  return SUPPORTED_LOCALES.some(locale => locale.code === code);
}

/**
 * Get locale definition by code
 */
export function getLocaleByCode(code: string): LocaleDefinition | undefined {
  return SUPPORTED_LOCALES.find(locale => locale.code === code);
}

/**
 * Parse language and region from locale code
 */
export function parseLocaleCode(code: string): { language: string; region: string } | null {
  const locale = getLocaleByCode(code);
  if (locale) {
    return { language: locale.language, region: locale.region };
  }
  return null;
}
