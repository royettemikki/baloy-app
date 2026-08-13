import { SmsProvider, SmsResult } from './types';

export class SemaphoreSmsProvider implements SmsProvider {
  private apiKey: string;
  private senderName?: string;

  constructor(apiKey: string, senderName?: string) {
    this.apiKey = apiKey;
    this.senderName = senderName;
  }

  async send(phoneNumber: string, message: string): Promise<SmsResult> {
    const body = new URLSearchParams({
      apikey: this.apiKey,
      number: phoneNumber,
      message,
    });
    if (this.senderName) body.set('sendername', this.senderName);

    try {
      const res = await fetch('https://api.semaphore.co/api/v4/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });

      if (!res.ok) {
        return { success: false, error: `Semaphore returned status ${res.status}` };
      }
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error sending SMS.',
      };
    }
  }
}
