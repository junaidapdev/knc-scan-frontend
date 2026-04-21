/** Body of POST /rewards/:unique_code/confirm-redeem-step-2. */
export interface RedemptionStep2Payload {
  branch_qr_identifier: string;
  device_fingerprint?: string;
}
