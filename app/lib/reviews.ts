// Review shapes shared by the server (Judge.me client) and the product page.

export type PublicReview = {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  name: string;
  date: string;
  verified: boolean;
  photos: string[];
};

export type ReviewsPayload = {
  configured: boolean;
  reviews: PublicReview[];
  total: number;
};
