// src/features/statements/types/statements.types.ts

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface StatementKpis {
  gatewayCollections: number;
  totalRides: number;
  driverPayouts: {
    amount: number;
    percentage: number;
  };
  platformRevenue: {
    amount: number;
    percentage: number;
  };
}

export interface ChartDataPoint {
  month: string;
  collections: number;
  disbursements: number;
}

export interface Transaction {
  id: string;
  type: "collection" | "disbursement" | string;
  description: string;
  date: string;
  amount: number;
}

export interface FinancialStatement {
  kpis: StatementKpis;
  chart: ChartDataPoint[];
  recentTransactions: Transaction[];
}