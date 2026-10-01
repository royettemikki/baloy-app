import { existsSync, rmSync } from 'node:fs';

if (existsSync('.next')) {
  rmSync('.next', { recursive: true, force: true });
  console.log('Removed .next cache.');
}
