import { API_ENDPOINTS } from '@/constants/api';
import type { Branch, BranchListResponse } from '@/interfaces/branch';
import { http } from '@/lib/api';

export async function listBranches(): Promise<Branch[]> {
  const res = await http.get<BranchListResponse>(API_ENDPOINTS.BRANCHES.LIST);
  return res.branches;
}

export async function findBranchByQrIdentifier(
  qrIdentifier: string,
): Promise<Branch | undefined> {
  const branches = await listBranches();
  return branches.find((b) => b.qr_identifier === qrIdentifier && b.active);
}
