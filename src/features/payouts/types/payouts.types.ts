export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface PayoutKpis {
  totalCollected: {
    amount: number;
    ytdGrowthPercentage: number;
  };
  driverPayouts: {
    amount: number;
    percentageDisbursed: number;
  };
  platformRevenue: {
    amount: number;
    percentageCommission: number;
  };
  currentMonthRevenue: {
    amount: number;
    month: string;
    year: number;
  };
}

export interface MonthlyPayoutBreakdown {
  month: string;
  driverPayout: number;
  platformRevenue: number;
  total: number;
}

export interface CollectionsGrowthPoint {
  month: string;
  totalCollected: number;
}

export interface PayoutCharts {
  monthlyPayoutBreakdown: MonthlyPayoutBreakdown[];
  collectionsGrowthTrend: CollectionsGrowthPoint[];
}

export interface TopDriverPendingPayout {
  driverId: string;
  rank: number;
  name: string;
  location: string;
  rating: number;
  pendingAmount: number;
  ridesCount: number;
}

export interface GatewaySummary {
  pendingPayouts: {
    amount: number;
    numberOfDrivers: number;
  };
  collections: {
    percentage: number;
    amount: number;
  };
  disbursed: {
    percentage: number;
    amount: number;
  };
}

export interface PayoutsDashboard {
  kpis: PayoutKpis;
  charts: PayoutCharts;
  topDriversPendingPayout: TopDriverPendingPayout[];
  gatewaySummary: GatewaySummary;
}