export type SmsResult = { success: true } | { success: false; error: string };

export interface SmsProvider {
  send(phoneNumber: string, message: string): Promise<SmsResult>;
}
