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
  contentType: 'post' | 'poem';
  instruction: 'review' | 'rewrite';
  selectedText?: string;
}

export interface IAiRewriteResult {
  rewritten: string;
}
