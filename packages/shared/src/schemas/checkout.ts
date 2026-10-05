import { z } from "zod";

export const checkoutSchema = z
  .object({
    cardNumber: z
      .string()
      .regex(
        /^4242 4242 4242 4242$/,
        "For the beta, use test card 4242 4242 4242 4242",
      ),
    cardHolder: z
      .string()
      .trim()
      .min(3, "Card holder name must be at least 3 characters"),
    expirationDate: z
      .string()
      .trim()
      .regex(
        /^(0[1-9]|1[0-2])\/\d{2}$/,
        "Expiration date must be in MM/YY format",
      ),
    cvc: z
      .string()
      .trim()
      .regex(/^\d{3,4}$/, "CVC must be 3–4 digits"),
  })
  .strict();

export type CheckoutInput = z.infer<typeof checkoutSchema>;
