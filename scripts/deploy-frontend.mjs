import { cpSync, existsSync, rmSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const frontendDist = path.join(rootDir, 'frontend', 'dist');
const serverPublic = path.join(rootDir, 'server', 'public');

if (!existsSync(frontendDist)) {
  console.error('Frontend build output not found at:', frontendDist);
  process.exit(1);
}

mkdirSync(serverPublic, { recursive: true });
rmSync(path.join(serverPublic, 'assets'), { recursive: true, force: true });
rmSync(path.join(serverPublic, 'index.html'), { force: true });

cpSync(frontendDist, serverPublic, { recursive: true });
console.log('Frontend build deployed to server/public');
