import { useQuery } from '@tanstack/react-query';

import {
  ExchangeRateSnapshot,
  ExchangeRates,
  fetchExchangeRates,
} from '@/infrastructure/currency/ExchangeRateService';

const FALLBACK_SNAPSHOT: ExchangeRateSnapshot = {
  rates: {
    IDR: 1,
    USD: 0.000063,
    EUR: 0.000058,
    SGD: 0.000084,
    MYR: 0.00029,
  },
  date: '',
  source: 'fallback',
};

const STALE_TIME_MS = 30 * 60 * 1000;

export const exchangeRateQueryKey = ['exchangeRates'] as const;

export const useExchangeRates = () => {
  const query = useQuery({
    queryKey: exchangeRateQueryKey,
    queryFn: fetchExchangeRates,
    staleTime: STALE_TIME_MS,
    gcTime: STALE_TIME_MS * 2,
    retry: 2,
  });

  const snapshot = query.data ?? FALLBACK_SNAPSHOT;
  const rates: ExchangeRates = snapshot.rates;

  return {
    rates,
    date: snapshot.date,
    source: snapshot.source,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
    isLive: snapshot.source === 'live',
  };
};
