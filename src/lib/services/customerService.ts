import { API_ENDPOINTS } from '@/constants/api';
import type {
  CustomerProfileResponse,
  RegisterPayload,
  RegisterResponse,
} from '@/interfaces/customer';
import { http } from '@/lib/api';

export async function registerCustomer(
  payload: RegisterPayload,
  registrationToken: string,
): Promise<RegisterResponse> {
  return http.post<RegisterResponse>(
    API_ENDPOINTS.CUSTOMERS.REGISTER,
    payload,
    { token: registrationToken },
  );
}

/** GET /customers/me — requires session JWT (picked up from localStorage). */
export async function getMyProfile(): Promise<CustomerProfileResponse> {
  return http.get<CustomerProfileResponse>(API_ENDPOINTS.CUSTOMERS.ME);
}
