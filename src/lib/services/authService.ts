import { API_ENDPOINTS } from '@/constants/api';
import type {
  OtpRequestPayload,
  OtpRequestResponse,
  OtpVerifyPayload,
  OtpVerifyResponse,
} from '@/interfaces/auth';
import { http } from '@/lib/api';

export async function requestOtp(
  payload: OtpRequestPayload,
): Promise<OtpRequestResponse> {
  return http.post<OtpRequestResponse>(
    API_ENDPOINTS.AUTH.REQUEST_OTP,
    payload,
  );
}

export async function verifyOtp(
  payload: OtpVerifyPayload,
): Promise<OtpVerifyResponse> {
  return http.post<OtpVerifyResponse>(API_ENDPOINTS.AUTH.VERIFY_OTP, payload);
}
