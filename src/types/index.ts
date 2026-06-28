export interface Employee {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  job_title: string;
  department: string;
  salary: number;
  currency: string;
  country: string;
  date_of_joining: string;
  performance_rating: number;
  gender: string;
  previous_salary: number | null;
  salary_usd: number;
}

export interface EmployeeFormData {
  first_name: string;
  last_name: string;
  email: string;
  job_title: string;
  department: string;
  salary: string;
  currency: string;
  country: string;
  date_of_joining: string;
  performance_rating: string;
  gender: string;
}

export interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export interface EmployeesResponse {
  employees: Employee[];
  pagination: Pagination;
}

export interface EmployeeQueryParams {
  page: number;
  limit: number;
  search: string;
  department: string;
  country: string;
  minSalary: string;
  maxSalary: string;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
}

export interface BulkRaisePayload {
  department: string;
  country: string;
  raiseType: 'percentage' | 'flat';
  value: number;
  isPreview: boolean;
}

export interface BulkRaiseResult {
  affectedCount: number;
  originalTotalSpendUsd: number;
  newTotalSpendUsd: number;
  differenceUsd: number;
  message?: string;
}

export interface ImportResponse {
  message: string;
  insertedOrUpdated: number;
  details?: string[];
}

export interface AnalyticsSummary {
  headcount: number;
  totalSpendUsd: number;
  avgSalaryUsd: number;
  countriesCount: number;
  currenciesCount: number;
  globalPayGap: number;
}

export interface DepartmentData {
  department: string;
  count: number;
  total_spend_usd: number;
  avg_salary_usd: number;
}

export interface CountryData {
  country: string;
  currency: string;
  count: number;
  total_spend_usd: number;
  avg_salary_usd: number;
}

export interface SalaryBand {
  band: string;
  count: number;
}

export interface GenderPayGap {
  department: string;
  maleAvg: number;
  femaleAvg: number;
  gapPercent: number;
  ratio: number;
}

export interface AnalyticsData {
  summary: AnalyticsSummary;
  departments: DepartmentData[];
  countries: CountryData[];
  salaryBands: SalaryBand[];
  genderPayGap: GenderPayGap[];
}

export interface NlpQueryResult {
  matched: boolean;
  answer: string;
  visualizationType?: 'table' | 'text';
  data?: Employee[];
}
