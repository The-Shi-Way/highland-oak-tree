export interface IAiSuggestion {
  original: string;
  suggested: string;
  reason: string;
}

export interface IAiReviewResult {
  suggestions: IAiSuggestion[];
}

export interface IAiReviewRequest {
  content: string;
  leafType: 'prose' | 'blossom' | 'fruit' | 'seed';
  instruction: 'review' | 'rewrite';
  selectedText?: string;
}

export interface IAiRewriteResult {
  rewritten: string;
}
