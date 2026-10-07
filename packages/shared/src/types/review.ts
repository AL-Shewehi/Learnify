export interface ReviewResponse {
  _id: string;
  course: string;
  student: string | { _id: string; name: string; email: string };
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}
