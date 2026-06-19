import api from "../../../lib/axios";
import type {
  ApiResponse,
  ReviewsDashboard,
  ReviewsQueryParams,
} from "../types/reviews.types";

export const reviewsService = {
  getReviews: (params: ReviewsQueryParams = {}) =>
    api.get<ApiResponse<ReviewsDashboard>>("/api/v1/admins/dashboard/reviews", {
      params,
    }),
};
