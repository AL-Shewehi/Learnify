export interface ApiError {
  status: "fail" | "error";
  message: string;
}

export interface PaginatedResponse<T> {
  status: "success";
  results: number;
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
  data: {
    [key: string]: T[];
  };
}
