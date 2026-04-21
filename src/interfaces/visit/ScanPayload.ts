/** Body of POST /visits/scan — authorized by the 5-min scan JWT. */
export interface ScanPayload {
  branch_qr_identifier: string;
  bill_amount: number;
  device_fingerprint?: string;
}
