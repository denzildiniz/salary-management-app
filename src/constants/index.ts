export const DEPARTMENTS = [
  'Engineering', 'Product', 'Marketing', 'Sales',
  'HR', 'Finance', 'Legal', 'Operations',
] as const;

export const COUNTRIES = [
  'USA', 'UK', 'Germany', 'Canada', 'India', 'Japan',
] as const;

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'INR', 'JPY'] as const;

export const CURRENCY_LABELS: Record<string, string> = {
  USD: 'USD ($)',
  EUR: 'EUR (€)',
  GBP: 'GBP (£)',
  CAD: 'CAD ($)',
  INR: 'INR (₹)',
  JPY: 'JPY (¥)',
};

export const GENDERS = ['Male', 'Female', 'Non-binary'] as const;

export const PERFORMANCE_RATINGS: { value: string; label: string }[] = [
  { value: '1', label: '1 - Poor' },
  { value: '2', label: '2 - Fair' },
  { value: '3', label: '3 - Satisfactory' },
  { value: '4', label: '4 - Good' },
  { value: '5', label: '5 - Excellent' },
];
