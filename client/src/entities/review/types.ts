/** Review entity - represents a customer review */
export interface Review {
  id: number;
  name: string;
  rating: number;
  comment: string | null;
  service: string | null;
  location: string | null;
  approved: number;
  createdAt: string;
}

/** Review creation input */
export interface CreateReviewInput {
  name: string;
  rating: number;
  comment?: string;
  service?: string;
  location?: string;
}

/** Rating distribution for analytics */
export interface RatingDistribution {
  rating: number;
  count: number;
  percentage: number;
}
