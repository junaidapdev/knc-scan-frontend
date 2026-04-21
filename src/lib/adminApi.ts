import axios from 'axios';

import { env } from '@/config/env';
import { API_ENDPOINTS } from '@/constants/api';
import {
  ADMIN_AUTH_TOKEN_STORAGE_KEY,
  API_TIMEOUT_MS,
} from '@/constants/ui';
import { ADMIN_UNAUTHORIZED_EVENT } from '@/constants/admin';
import type {
  AdminCatalogFormPayload,
  AdminCatalogItem,
  AdminCustomerDetail,
  AdminCustomerListItem,
  AdminIssuedRewardDetail,
  AdminIssuedRewardRow,
  AdminKpiByBranch,
  AdminKpiSummary,
  AdminKpiTimeseriesPoint,
  AdminLoginPayload,
  AdminLoginResult,
  AdminUser,
} from '@/interfaces/admin';
import type { AdminCatalogStatus } from '@/constants/admin';
import { ApiCallError, http } from './api';

/**
 * Thin wrapper around the shared `http` helper that always forwards the
 * persisted admin JWT as the bearer token. On any 401 from an admin
 * endpoint, we dispatch a window event so `AdminAuthContext` can clear
 * state and redirect to /admin/login.
 */
function getAdminToken(): string | undefined {
  try {
    return localStorage.getItem(ADMIN_AUTH_TOKEN_STORAGE_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

function dispatchUnauthorized(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(ADMIN_UNAUTHORIZED_EVENT));
}

async function adminRequest<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof ApiCallError && err.status === 401) {
      dispatchUnauthorized();
    }
    throw err;
  }
}

export interface AdminPagedResult<T> {
  rows: T[];
  page: number;
  page_size: number;
  total: number;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function adminLogin(
  payload: AdminLoginPayload,
): Promise<AdminLoginResult> {
  // No admin token yet — call without bearer.
  return http.post<AdminLoginResult>(API_ENDPOINTS.ADMIN.LOGIN, payload);
}

export async function adminLogout(): Promise<{ ok: true }> {
  return adminRequest(() =>
    http.post<{ ok: true }>(
      API_ENDPOINTS.ADMIN.LOGOUT,
      undefined,
      { token: getAdminToken() },
    ),
  );
}

export async function adminMe(): Promise<AdminUser> {
  return adminRequest(() =>
    http.get<AdminUser>(API_ENDPOINTS.ADMIN.ME, { token: getAdminToken() }),
  );
}

// ---------------------------------------------------------------------------
// KPIs
// ---------------------------------------------------------------------------

export async function fetchKpiSummary(): Promise<AdminKpiSummary> {
  return adminRequest(() =>
    http.get<AdminKpiSummary>(API_ENDPOINTS.ADMIN.KPI_SUMMARY, {
      token: getAdminToken(),
    }),
  );
}

export async function fetchKpiByBranch(): Promise<AdminKpiByBranch[]> {
  return adminRequest(() =>
    http.get<AdminKpiByBranch[]>(API_ENDPOINTS.ADMIN.KPI_BY_BRANCH, {
      token: getAdminToken(),
    }),
  );
}

export async function fetchKpiTimeseries(params: {
  days?: number;
  branchId?: string;
}): Promise<AdminKpiTimeseriesPoint[]> {
  const query: Record<string, unknown> = {};
  if (params.days !== undefined) query.days = params.days;
  if (params.branchId) query.branch_id = params.branchId;
  return adminRequest(() =>
    http.get<AdminKpiTimeseriesPoint[]>(API_ENDPOINTS.ADMIN.KPI_TIMESERIES, {
      token: getAdminToken(),
      params: query,
    }),
  );
}

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

export interface ListCustomersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  tier?: 'standard' | 'silver' | 'gold';
  language?: 'ar' | 'en';
  sort?:
    | 'created_at.desc'
    | 'created_at.asc'
    | 'last_scan_at.desc'
    | 'total_visits.desc'
    | 'total_self_reported_spend_sar.desc';
}

export async function listCustomers(
  params: ListCustomersParams = {},
): Promise<AdminPagedResult<AdminCustomerListItem>> {
  const query: Record<string, unknown> = {};
  if (params.page !== undefined) query.page = params.page;
  if (params.pageSize !== undefined) query.page_size = params.pageSize;
  if (params.search) query.search = params.search;
  if (params.tier) query.tier = params.tier;
  if (params.language) query.language = params.language;
  if (params.sort) query.sort = params.sort;
  return adminRequest(() =>
    http.get<AdminPagedResult<AdminCustomerListItem>>(
      API_ENDPOINTS.ADMIN.CUSTOMERS_LIST,
      { token: getAdminToken(), params: query },
    ),
  );
}

export async function getCustomerDetail(id: string): Promise<AdminCustomerDetail> {
  return adminRequest(() =>
    http.get<AdminCustomerDetail>(API_ENDPOINTS.ADMIN.CUSTOMER_DETAIL(id), {
      token: getAdminToken(),
    }),
  );
}

export async function softDeleteCustomer(
  id: string,
): Promise<{ ok: true; id: string }> {
  return adminRequest(() =>
    http.delete<{ ok: true; id: string }>(
      API_ENDPOINTS.ADMIN.CUSTOMER_DETAIL(id),
      { token: getAdminToken() },
    ),
  );
}

/**
 * Export customers as CSV. This bypasses the envelope interceptor — the
 * backend streams `text/csv` directly, not `{ success, data }`. We use a
 * one-off axios call with `responseType: 'blob'` to avoid the shared
 * interceptor choking on non-JSON responses.
 */
export async function exportCustomersCsv(): Promise<Blob> {
  const token = getAdminToken();
  try {
    const res = await axios.get<Blob>(
      `${env.VITE_API_BASE_URL}${API_ENDPOINTS.ADMIN.CUSTOMERS_EXPORT}`,
      {
        responseType: 'blob',
        timeout: API_TIMEOUT_MS,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      },
    );
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      dispatchUnauthorized();
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

export async function listCatalog(
  status?: AdminCatalogStatus,
): Promise<AdminCatalogItem[]> {
  return adminRequest(() =>
    http.get<AdminCatalogItem[]>(API_ENDPOINTS.ADMIN.CATALOG_LIST, {
      token: getAdminToken(),
      params: status ? { status } : undefined,
    }),
  );
}

export async function createCatalogItem(
  payload: AdminCatalogFormPayload,
): Promise<AdminCatalogItem> {
  return adminRequest(() =>
    http.post<AdminCatalogItem>(API_ENDPOINTS.ADMIN.CATALOG_LIST, payload, {
      token: getAdminToken(),
    }),
  );
}

export async function updateCatalogItem(
  id: string,
  payload: Partial<AdminCatalogFormPayload>,
): Promise<AdminCatalogItem> {
  return adminRequest(() =>
    http.patch<AdminCatalogItem>(
      API_ENDPOINTS.ADMIN.CATALOG_DETAIL(id),
      payload,
      { token: getAdminToken() },
    ),
  );
}

export async function pauseCatalogItem(id: string): Promise<AdminCatalogItem> {
  return adminRequest(() =>
    http.post<AdminCatalogItem>(
      API_ENDPOINTS.ADMIN.CATALOG_PAUSE(id),
      undefined,
      { token: getAdminToken() },
    ),
  );
}

export async function resumeCatalogItem(id: string): Promise<AdminCatalogItem> {
  return adminRequest(() =>
    http.post<AdminCatalogItem>(
      API_ENDPOINTS.ADMIN.CATALOG_RESUME(id),
      undefined,
      { token: getAdminToken() },
    ),
  );
}

export async function archiveCatalogItem(id: string): Promise<AdminCatalogItem> {
  return adminRequest(() =>
    http.post<AdminCatalogItem>(
      API_ENDPOINTS.ADMIN.CATALOG_ARCHIVE(id),
      undefined,
      { token: getAdminToken() },
    ),
  );
}

// ---------------------------------------------------------------------------
// Issued rewards
// ---------------------------------------------------------------------------

export interface ListIssuedParams {
  page?: number;
  pageSize?: number;
  status?: 'pending' | 'redeemed' | 'expired';
  customerId?: string;
  catalogId?: string;
  includeVoided?: boolean;
  voidedOnly?: boolean;
}

export async function listIssuedRewards(
  params: ListIssuedParams = {},
): Promise<AdminPagedResult<AdminIssuedRewardRow>> {
  const query: Record<string, unknown> = {};
  if (params.page !== undefined) query.page = params.page;
  if (params.pageSize !== undefined) query.page_size = params.pageSize;
  if (params.status) query.status = params.status;
  if (params.customerId) query.customer_id = params.customerId;
  if (params.catalogId) query.catalog_id = params.catalogId;
  if (params.includeVoided !== undefined) {
    query.include_voided = params.includeVoided ? 'true' : 'false';
  }
  if (params.voidedOnly !== undefined) {
    query.voided_only = params.voidedOnly ? 'true' : 'false';
  }
  return adminRequest(() =>
    http.get<AdminPagedResult<AdminIssuedRewardRow>>(
      API_ENDPOINTS.ADMIN.ISSUED_LIST,
      { token: getAdminToken(), params: query },
    ),
  );
}

export async function getIssuedRewardDetail(
  id: string,
): Promise<AdminIssuedRewardDetail> {
  return adminRequest(() =>
    http.get<AdminIssuedRewardDetail>(API_ENDPOINTS.ADMIN.ISSUED_DETAIL(id), {
      token: getAdminToken(),
    }),
  );
}

export async function voidIssuedReward(
  id: string,
  reason: string,
): Promise<AdminIssuedRewardDetail> {
  return adminRequest(() =>
    http.post<AdminIssuedRewardDetail>(
      API_ENDPOINTS.ADMIN.ISSUED_VOID(id),
      { reason },
      { token: getAdminToken() },
    ),
  );
}
