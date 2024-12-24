export interface APIResponse<T> {
  data?: T;
  error?: APIError;
  metadata?: {
    processingTime: number;
    timestamp: string;
  };
}

export interface APIError {
  code: string;
  message: string;
  details?: unknown;
}
