import {
  BASE_CURRENCY,
  SUPPORTED_CURRENCIES,
  SupportedCurrency,
} from '@/lib/constants';

export type ExchangeRates = Record<SupportedCurrency, number>;

export interface ExchangeRateSnapshot {
  rates: ExchangeRates;
  date: string;
  source: 'live' | 'fallback';
}

/** Approximate fallback when API is unavailable (IDR → target per 1 IDR). */
const FALLBACK_RATES: ExchangeRates = {
  IDR: 1,
  USD: 0.000063,
  EUR: 0.000058,
  SGD: 0.000084,
  MYR: 0.00029,
};

const buildRates = (apiRates: Partial<Record<SupportedCurrency, number>>): ExchangeRates => {
  const rates = { IDR: 1 } as ExchangeRates;
  for (const currency of SUPPORTED_CURRENCIES) {
    if (currency === BASE_CURRENCY) continue;
    rates[currency] = apiRates[currency] ?? FALLBACK_RATES[currency];
  }
  return rates;
};

const fetchFromOpenErApi = async (): Promise<ExchangeRateSnapshot> => {
  const response = await fetch(`https://open.er-api.com/v6/latest/${BASE_CURRENCY}`);

  if (!response.ok) {
    throw new Error(`Exchange rate API error: ${response.status}`);
  }

  const data = (await response.json()) as {
    result: string;
    rates: Partial<Record<SupportedCurrency, number>>;
    time_last_update_utc?: string;
  };

  if (data.result !== 'success') {
    throw new Error('Exchange rate API returned unsuccessful result');
  }

  return {
    rates: buildRates(data.rates),
    date: data.time_last_update_utc?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    source: 'live',
  };
};

export const fetchExchangeRates = async (): Promise<ExchangeRateSnapshot> => {
  try {
    return await fetchFromOpenErApi();
  } catch {
    return {
      rates: FALLBACK_RATES,
      date: new Date().toISOString().slice(0, 10),
      source: 'fallback',
    };
  }
};
