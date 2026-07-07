import { useCallback, useMemo } from 'react';

import {
  formatConvertedCurrency,
  convertAmount,
  parseDisplayAmount,
  formatDisplayAmountInput,
} from '@/lib/utils/currency';
import { useSettingsStore } from '@/store/settingsStore';
import { BASE_CURRENCY, SupportedCurrency } from '@/lib/constants';
import { useExchangeRates } from '@/presentation/hooks/useExchangeRates';

export const useCurrencyFormat = () => {
  const currency = useSettingsStore((s) => s.currency);
  const language = useSettingsStore((s) => s.language);
  const { rates, date, source, isLoading, isLive } = useExchangeRates();

  const locale = language === 'id' ? 'id-ID' : 'en-US';

  const format = useCallback(
    (amountInBase: number) => formatConvertedCurrency(amountInBase, currency, rates, locale),
    [currency, rates, locale],
  );

  const convert = useCallback(
    (amountInBase: number, target: SupportedCurrency = currency) =>
      convertAmount(amountInBase, BASE_CURRENCY, target, rates),
    [currency, rates],
  );

  const toDisplayAmount = useCallback(
    (amountInBase: number) => convertAmount(amountInBase, BASE_CURRENCY, currency, rates),
    [currency, rates],
  );

  const toBaseAmount = useCallback(
    (displayAmount: number) => convertAmount(displayAmount, currency, BASE_CURRENCY, rates),
    [currency, rates],
  );

  const parseInput = useCallback(
    (value: string) => parseDisplayAmount(value, currency),
    [currency],
  );

  const formatInput = useCallback(
    (amount: number) => formatDisplayAmountInput(amount, currency, locale),
    [currency, locale],
  );

  return useMemo(
    () => ({
      format,
      convert,
      toDisplayAmount,
      toBaseAmount,
      parseInput,
      formatInput,
      currency,
      rates,
      rateDate: date,
      rateSource: source,
      isRatesLoading: isLoading,
      isLiveRate: isLive,
    }),
    [
      format,
      convert,
      toDisplayAmount,
      toBaseAmount,
      parseInput,
      formatInput,
      currency,
      rates,
      date,
      source,
      isLoading,
      isLive,
    ],
  );
};
