import { functions } from '@/config/firebase';
import { httpsCallable } from 'firebase/functions';
import type {
  CreatePaymentIntentRequest,
  CreatePaymentIntentResponse,
  ConfirmSettlementRequest,
  ConfirmSettlementResponse,
} from '@/types';

const createPaymentIntentFn = httpsCallable<
  CreatePaymentIntentRequest,
  CreatePaymentIntentResponse
>(functions, 'createpaymentintent');

const confirmSettlementFn = httpsCallable<
  ConfirmSettlementRequest,
  ConfirmSettlementResponse
>(functions, 'confirmsettlement');

export async function createPaymentIntent(
  data: CreatePaymentIntentRequest,
): Promise<CreatePaymentIntentResponse> {
  const result = await createPaymentIntentFn(data);
  return result.data;
}

export async function confirmSettlement(
  data: ConfirmSettlementRequest,
): Promise<ConfirmSettlementResponse> {
  const result = await confirmSettlementFn(data);
  return result.data;
}
