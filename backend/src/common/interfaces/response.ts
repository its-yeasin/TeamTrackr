export interface ApiResponse<T = unknown> {
  error: boolean;
  data: T | null;
  message: string;
  stack?: string;
}
