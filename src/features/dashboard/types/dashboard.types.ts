export interface DashboardMetrics {
  activePassengers: { total: number; growth: number; online: number };
  activeDrivers: { total: number; growth: number; online: number };
  ridesToday: { total: number; growth: number; inProgress: number };
  revenueToday: { total: number; growth: number; commission: number };
  pendingPayouts: { total: number; driverCount: number };
  completedRides: { today: number };
  cancelledRides: { total: number; rate: number };
  activeDisputes: { total: number };
  gatewaySuccess: { rate: number; successful: number; total: number };
  avgResponseTime: { minutes: number };
}

export interface WeeklyRide { day: string; count: number }
export interface MonthlyRevenue { month: string; revenue: number }
export interface PeakHour { hour: string; count: number }
export interface RideStatusItem { status: string; count: number; percentage: number }

export interface DashboardCharts {
  weeklyRides: WeeklyRide[];
  monthlyRevenue: MonthlyRevenue[];
  peakHours: PeakHour[];
  rideStatus: RideStatusItem[];
}

export interface TopLocation { address: string; count: number }

export interface RecentActivityItem {
  type: "trip" | "passenger" | "driver";
  label: string;
  data: Record<string, unknown>;
  time: string;
}

export interface DashboardLists {
  topLocations: TopLocation[];
  recentActivity: RecentActivityItem[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}