/** Response body from POST /customers/register (unwrapped). */
export interface RegisterResponseCustomer {
  id: string;
  phone: string;
  name: string;
}

export interface RegisterResponseStamp {
  current: number;
  max: number;
  reward_preview: unknown | null;
}

export interface RegisterResponseSession {
  token: string;
}

export interface RegisterResponse {
  customer: RegisterResponseCustomer;
  stamp: RegisterResponseStamp;
  session: RegisterResponseSession;
}
