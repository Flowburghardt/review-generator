export interface ProjectTypeConfig {
  id: string;
  label: string;
  /**
   * Aussagen, keine Eigenschaften. Der Prompt baut den Text um 1-2 davon herum,
   * deshalb muss hier etwas Erzählbares stehen ("Seite war schnell online"),
   * kein Adjektiv ("zuverlässig"). Adjektive erzeugen wieder Adjektiv-Texte.
   */
  factChips: string[];
}

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
  projectTypes: ProjectTypeConfig[];
  /** Notausgang: Wer hiervon etwas wählt, wird zum Feedback-Screen geleitet statt zu Google. */
  negativeChips: string[];
  aiContext: string;
  feedbackEmail?: string;
}

export interface GenerateRequest {
  clientSlug: string;
  projectTypes: string[];
  selectedFacts: string[];
  personalNote?: string;
  tone?: string;
  projectName?: string;
}

export interface GenerateResponse {
  reviewText: string;
  /** Die Notiz wurde vom Injection-Filter verworfen — im UI sichtbar machen. */
  noteDropped?: boolean;
}

export interface GenerateErrorResponse {
  error: string;
  retryable: boolean;
}
