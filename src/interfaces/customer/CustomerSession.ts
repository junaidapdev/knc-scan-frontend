import type { Customer } from './Customer';

/** Long-lived customer session stored in localStorage + memory. */
export interface CustomerSession {
  token: string;
  customer: Pick<Customer, 'id' | 'name' | 'phone'>;
}
