import { SmsProvider } from './types';
import { ConsoleSmsProvider } from './consoleProvider';
import { SemaphoreSmsProvider } from './semaphoreProvider';

export function getSmsProvider(): SmsProvider {
  const providerName = process.env.SMS_PROVIDER ?? 'console';

  if (providerName === 'semaphore') {
    const apiKey = process.env.SEMAPHORE_API_KEY;
    if (!apiKey) {
      throw new Error('SMS_PROVIDER is set to "semaphore" but SEMAPHORE_API_KEY is missing.');
    }
    return new SemaphoreSmsProvider(apiKey, process.env.SEMAPHORE_SENDER_NAME);
  }

  return new ConsoleSmsProvider();
}

export * from './types';
