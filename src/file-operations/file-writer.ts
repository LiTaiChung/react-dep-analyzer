import fs from 'fs';
import path from 'path';

export function ensureDirectoryExists(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function writeFileSync(filePath: string, content: string): void {
  ensureDirectoryExists(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
}

export function readFileSync(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
}