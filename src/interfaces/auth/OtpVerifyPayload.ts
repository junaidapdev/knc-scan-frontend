/** Body of POST /auth/otp/verify. */
export interface OtpVerifyPayload {
  phone: string;
  otp: string;
}
