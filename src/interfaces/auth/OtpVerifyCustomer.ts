/** Existing-customer summary returned when OTP verification logs a customer in. */
export interface OtpVerifyCustomer {
  id: string;
  name: string | null;
  phone: string;
}
