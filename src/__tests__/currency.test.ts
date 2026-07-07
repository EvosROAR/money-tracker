import {
  convertAmount,
  formatConvertedCurrency,
  parseAmountInput,
  parseDisplayAmount,
  formatDisplayAmountInput,
} from '@/lib/utils/currency';
import { ExchangeRates } from '@/infrastructure/currency/ExchangeRateService';

const rates: ExchangeRates = {
  IDR: 1,
  USD: 0.000062,
  EUR: 0.000057,
  SGD: 0.000084,
  MYR: 0.00029,
};

describe('currency utils', () => {
  it('converts IDR to USD', () => {
    const usd = convertAmount(1_000_000, 'IDR', 'USD', rates);
    expect(usd).toBeCloseTo(62, 0);
  });

  it('converts USD back to IDR', () => {
    const idr = convertAmount(10, 'USD', 'IDR', rates);
    expect(idr).toBeCloseTo(10 / rates.USD, 0);
  });

  it('formats converted currency', () => {
    const formatted = formatConvertedCurrency(1_000_000, 'USD', rates, 'en-US');
    expect(formatted).toContain('$');
  });

  it('parses IDR amount input', () => {
    expect(parseAmountInput('1.500.000')).toBe(1500000);
    expect(parseAmountInput('')).toBe(0);
  });

  it('parses and formats display amounts for USD', () => {
    expect(parseDisplayAmount('12.50', 'USD')).toBeCloseTo(12.5);
    expect(formatDisplayAmountInput(12.5, 'USD', 'en-US')).toContain('12.5');
  });
});
