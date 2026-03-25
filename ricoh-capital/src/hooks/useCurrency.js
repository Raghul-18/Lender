import { useCurrencyStore, CURRENCIES } from '../store/currencyStore';

export function useCurrency() {
  const { currencyCode, setCurrency } = useCurrencyStore();
  const currency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];

  /** Format a number with the current currency symbol */
  const format = (amount) => {
    const num = Number(amount) || 0;
    return `${currency.symbol}${num.toLocaleString()}`;
  };

  return {
    symbol: currency.symbol,
    code: currency.code,
    label: currency.label,
    format,
    setCurrency,
    currencies: CURRENCIES,
  };
}
