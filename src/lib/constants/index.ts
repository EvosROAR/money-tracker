export const STORAGE_KEYS = {
  REMEMBER_ME: '@money_tracker/remember_me',
  THEME_MODE: '@money_tracker/theme_mode',
  LANGUAGE: '@money_tracker/language',
  CURRENCY: '@money_tracker/currency',
  ONBOARDING_COMPLETED: '@money_tracker/onboarding_completed',
  BIOMETRIC_LOCK: '@money_tracker/biometric_lock',
} as const;

export const DEFAULT_CURRENCY = 'IDR' as const;

/** Amounts in Firestore are stored in this base currency. */
export const BASE_CURRENCY = DEFAULT_CURRENCY;

export const SUPPORTED_CURRENCIES = ['IDR', 'USD', 'EUR', 'SGD', 'MYR'] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  IDR: 'Rp',
  USD: '$',
  EUR: '€',
  SGD: 'S$',
  MYR: 'RM',
};

export const CURRENCY_LABELS: Record<SupportedCurrency, { id: string; en: string }> = {
  IDR: { id: 'Rupiah Indonesia', en: 'Indonesian Rupiah' },
  USD: { id: 'Dolar AS', en: 'US Dollar' },
  EUR: { id: 'Euro', en: 'Euro' },
  SGD: { id: 'Dolar Singapura', en: 'Singapore Dollar' },
  MYR: { id: 'Ringgit Malaysia', en: 'Malaysian Ringgit' },
};

export const SUPPORTED_LANGUAGES = ['id', 'en'] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_FLAGS: Record<SupportedLanguage, string> = {
  id: '🇮🇩',
  en: '🇺🇸',
};

export const BUDGET_WARNING_THRESHOLD = 0.8;
