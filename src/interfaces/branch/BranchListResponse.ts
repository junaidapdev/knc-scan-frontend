import type { Branch } from './Branch';

/** Unwrapped response body from GET /branches. */
export interface BranchListResponse {
  branches: Branch[];
}
