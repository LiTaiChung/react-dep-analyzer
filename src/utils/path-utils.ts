import fs from 'fs';
import path from 'path';

export function findProjectRoot(startPath: string): string {
  let currentPath = startPath;
  
  while (currentPath !== path.parse(currentPath).root) {
    console.log('搜尋 package.json 的目錄:', currentPath);
    
    const packageJsonPath = path.join(currentPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      console.log('找到 package.json:', packageJsonPath);
      return currentPath;
    }
    
    currentPath = path.dirname(currentPath);
  }
  
  console.warn('警告: 未找到 package.json，使用當前目錄作為專案根目錄');
  return startPath;
}

export function resolveRelativePath(projectRoot: string, targetPath: string): string {
  return path.resolve(projectRoot, targetPath);
}

export function getRelativePath(from: string, to: string): string {
  return path.relative(from, to);
}