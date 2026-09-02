import { handlePhoneSignupIntentRequest } from 'sa2kit/common/auth/server';

export async function POST(request: Request) {
  return handlePhoneSignupIntentRequest(request);
}
