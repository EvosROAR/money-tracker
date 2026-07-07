import { BASE_CURRENCY, DEFAULT_CURRENCY, SupportedCurrency, CURRENCY_SYMBOLS } from '@/lib/constants';
import { ExchangeRates } from '@/infrastructure/currency/ExchangeRateService';

export const convertAmount = (
  amount: number,
  from: SupportedCurrency,
  to: SupportedCurrency,
  rates: ExchangeRates,
): number => {
  if (from === to) return amount;

  const toBase = (value: number, currency: SupportedCurrency): number =>
    currency === BASE_CURRENCY ? value : value / rates[currency];

  const fromBase = (value: number, currency: SupportedCurrency): number =>
    currency === BASE_CURRENCY ? value : value * rates[currency];

  return fromBase(toBase(amount, from), to);
};

export const formatCurrency = (
  amount: number,
  currency: SupportedCurrency = DEFAULT_CURRENCY,
  locale = 'id-ID',
): string => {
  const symbol = CURRENCY_SYMBOLS[currency];

  if (currency === 'IDR') {
    return `${symbol} ${amount.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatConvertedCurrency = (
  amountInBase: number,
  displayCurrency: SupportedCurrency,
  rates: ExchangeRates,
  locale = 'id-ID',
): string => {
  const converted = convertAmount(amountInBase, BASE_CURRENCY, displayCurrency, rates);
  return formatCurrency(converted, displayCurrency, locale);
};

export const parseAmountInput = (value: string): number => {
  const cleaned = value.replace(/[^\d]/g, '');
  return cleaned ? parseInt(cleaned, 10) : 0;
};

export const formatAmountInput = (amount: number): string => {
  if (!amount) return '';
  return amount.toLocaleString('id-ID');
};

export const parseDisplayAmount = (value: string, currency: SupportedCurrency): number => {
  if (currency === 'IDR') return parseAmountInput(value);

  const cleaned = value.replace(/[^\d.,]/g, '').replace(',', '.');
  const parts = cleaned.split('.');
  const normalized =
    parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : cleaned;
  const parsed = parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const formatDisplayAmountInput = (
  amount: number,
  currency: SupportedCurrency,
  locale = 'id-ID',
): string => {
  if (!amount) return '';
  if (currency === 'IDR') return formatAmountInput(amount);

  const formatLocale = locale === 'id-ID' ? 'en-US' : locale;
  return amount.toLocaleString(formatLocale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};
