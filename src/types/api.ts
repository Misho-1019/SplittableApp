export interface CreatePaymentIntentRequest {
  amount: number;
  currency: string;
  groupId: string;
  toUserId: string;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  settlementId: string;
}

export interface ConfirmSettlementRequest {
  settlementId: string;
  groupId: string;
  paymentIntentId: string;
}

export interface ConfirmSettlementResponse {
  success: boolean;
}

export interface CloudFunctionError {
  code: string;
  message: string;
  details?: unknown;
}
