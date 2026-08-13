import { SmsProvider, SmsResult } from './types';

export class ConsoleSmsProvider implements SmsProvider {
  async send(phoneNumber: string, message: string): Promise<SmsResult> {
    console.log('--- SMS (dry run, nothing actually sent) ---');
    console.log(`To: ${phoneNumber}`);
    console.log(`Message: ${message}`);
    console.log('--------------------------------------------');
    return { success: true };
  }
}
