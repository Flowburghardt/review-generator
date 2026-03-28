export interface ClientConfig {
  slug: string;
  businessName: string;
  ownerName: string;
  welcomeText: string;
  googleReviewUrl: string;
  branding: {
    accentColor: string;
    accentColorLight: string;
    bgColor: string;
    textColor: string;
    logoUrl?: string;
    fontDisplay?: string;
  };
  categories: Array<{
    id: string;
    label: string;
    icon?: string;
  }>;
  moodTags: Array<{
    label: string;
    sentiment: "positive" | "neutral" | "negative";
  }>;
  aiContext: string;
  feedbackEmail?: string;
}

export interface GenerateRequest {
  clientSlug: string;
  ratings: Record<string, number>;
  selectedTags: string[];
  personalNote?: string;
  tone?: string;
  projectTypes?: string[];
  projectName?: string;
}

export interface GenerateResponse {
  reviewText: string;
  overallStars: number;
}

export interface GenerateErrorResponse {
  error: string;
  retryable: boolean;
}
