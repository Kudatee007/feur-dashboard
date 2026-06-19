export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface StarsBreakdown {
  "1": number;
  "2": number;
  "3": number;
  "4": number;
  "5": number;
}

export interface ReviewKpis {
  averageRating: number;
  totalReviews: number;
  starsBreakdown: StarsBreakdown;
}

export interface ReviewItem {
  rideId: string;
  rideCode: string;
  passengerName: string;
  driverName: string;
  rating: number;
  comment: string;
  date: string;
  helpfulCount: number;
}

export interface ReviewsPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReviewsDashboard {
  kpis: ReviewKpis;
  reviews: ReviewItem[];
  pagination: ReviewsPagination;
}

export interface ReviewsQueryParams {
  page?: number;
  limit?: number;
}