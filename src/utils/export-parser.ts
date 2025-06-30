export function getExports(content: string): string[] {
  const exports: string[] = [];

  const namedExports = content.match(/export\s+{([^}]+)}/g);
  if (namedExports) {
    namedExports.forEach((exp) => {
      const names = exp.match(/export\s+{([^}]+)}/)?.[1] ?? '';
      exports.push(...names.split(',').map((n) => n.trim()));
    });
  }

  const directExports = content.match(/export\s+(const|function|class)\s+(\w+)/g);
  if (directExports) {
    directExports.forEach((exp) => {
      const match = exp.match(/export\s+(const|function|class)\s+(\w+)/);
      if (match) exports.push(match[2]);
    });
  }

  const defaultExport = content.match(/export\s+default\s+(\w+)/);
  if (defaultExport) {
    exports.push(defaultExport[1]);
  }

  return [...new Set(exports)].filter(Boolean);
}