import { AnalyzerOptions } from '../types';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateAnalyzerOptions(options: AnalyzerOptions): void {
  if (options.name !== undefined && typeof options.name !== 'string') {
    throw new ValidationError('Name must be a string');
  }

  if (options.targetPath !== undefined && typeof options.targetPath !== 'string') {
    throw new ValidationError('Target path must be a string');
  }

  if (options.pagesPath !== undefined && typeof options.pagesPath !== 'string') {
    throw new ValidationError('Pages path must be a string');
  }

  if (options.fileExtensions !== undefined) {
    if (!Array.isArray(options.fileExtensions)) {
      throw new ValidationError('File extensions must be an array');
    }
    if (options.fileExtensions.some(ext => typeof ext !== 'string')) {
      throw new ValidationError('File extensions must be strings');
    }
  }

  if (options.componentPaths !== undefined) {
    if (!Array.isArray(options.componentPaths)) {
      throw new ValidationError('Component paths must be an array');
    }
    options.componentPaths.forEach((pathConfig, index) => {
      if (!pathConfig.path || typeof pathConfig.path !== 'string') {
        throw new ValidationError(`Component path at index ${index} must have a valid path string`);
      }
      if (!pathConfig.importPrefix || typeof pathConfig.importPrefix !== 'string') {
        throw new ValidationError(`Component path at index ${index} must have a valid import prefix string`);
      }
    });
  }

  if (options.outputDir !== undefined && typeof options.outputDir !== 'string') {
    throw new ValidationError('Output directory must be a string');
  }

  if (options.exportNamePattern !== undefined && !(options.exportNamePattern instanceof RegExp)) {
    throw new ValidationError('Export name pattern must be a RegExp');
  }
}

export function sanitizePath(inputPath: string): string {
  return inputPath.replace(/[<>:"|?*]/g, '_').replace(/\\/g, '/');
}