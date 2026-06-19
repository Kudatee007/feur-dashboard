import { useQuery } from "@tanstack/react-query";
import { reviewsService } from "../services/reviews.service";
import type { ReviewsDashboard, ReviewsQueryParams } from "../types/reviews.types";

export const reviewsKeys = {
  all: ["reviews"] as const,
  list: (params: ReviewsQueryParams) => [...reviewsKeys.all, "list", params] as const,
};

function unwrap<T>(res: any): T {
  const body = res.data as any;
  return (body?.data?.data ?? body?.data ?? body) as T;
}

export function useReviews(params: ReviewsQueryParams = {}) {
  return useQuery({
    queryKey: reviewsKeys.list(params),
    queryFn: async () => {
      const res = await reviewsService.getReviews(params);
      const payload = unwrap<ReviewsDashboard>(res);
      if (!payload?.kpis) throw new Error("Unexpected reviews shape");
      return payload;
    },
    staleTime: 1000 * 30,
    placeholderData: (prev) => prev,
  });
}