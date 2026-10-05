export interface CheckoutReceipt {
  id: string;
  amount: number;
  status: "succeeded";
  paidAt: string;
}
