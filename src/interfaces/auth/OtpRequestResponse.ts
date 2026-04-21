/** Response from POST /auth/otp/request. */
export interface OtpRequestResponse {
  message: string;
  /**
   * Echo of the generated OTP. Only present when the backend is running with
   * NODE_ENV=development — the frontend surfaces it as a yellow dev banner so
   * testers don't have to scrape the backend terminal.
   */
  devOtp?: string;
}
