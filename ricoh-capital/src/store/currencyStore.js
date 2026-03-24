import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const CURRENCIES = [
  { code: 'GBP', symbol: '£',    label: 'British Pound (£)' },
  { code: 'USD', symbol: '$',    label: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€',    label: 'Euro (€)' },
  { code: 'AED', symbol: 'AED ', label: 'UAE Dirham (AED)' },
  { code: 'INR', symbol: '₹',    label: 'Indian Rupee (₹)' },
  { code: 'AUD', symbol: 'A$',   label: 'Australian Dollar (A$)' },
  { code: 'CAD', symbol: 'C$',   label: 'Canadian Dollar (C$)' },
  { code: 'SGD', symbol: 'S$',   label: 'Singapore Dollar (S$)' },
  { code: 'ZAR', symbol: 'R',    label: 'South African Rand (R)' },
  { code: 'NGN', symbol: '₦',    label: 'Nigerian Naira (₦)' },
];

export const useCurrencyStore = create(
  persist(
    (set) => ({
      currencyCode: 'GBP',
      setCurrency: (code) => set({ currencyCode: code }),
    }),
    { name: 'zoro-currency' }
  )
);

/** Use outside React (e.g. in mutation closures) */
export function getCurrencySymbol() {
  const { currencyCode } = useCurrencyStore.getState();
  return (CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0]).symbol;
}
