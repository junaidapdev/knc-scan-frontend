/**
 * Response from POST /auth/otp/verify. `token` is a short-lived JWT with
 * scope='registration' used only to authorize POST /customers/register.
 */
export interface OtpVerifyResponse {
  token: string;
  scope: 'registration';
}
