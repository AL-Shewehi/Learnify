export interface ApiSuccess<T> {
  status: "success";
  data: T;
}

export interface ApiErrorBody {
  status: "fail" | "error";
  message: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface PaginatedSuccess<T> extends ApiSuccess<T> {
  results: number;
  pagination: PaginationMeta;
}