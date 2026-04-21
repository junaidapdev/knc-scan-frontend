import type { Customer } from './Customer';

/** Response body from GET /customers/me (unwrapped). */
export interface CustomerProfileResponse {
  profile: Customer;
}
