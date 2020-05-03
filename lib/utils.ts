import { extname } from 'path';
import { existsSync } from 'fs';

export const validExtensions = ['.js', '.jsx', '.ts', '.tsx'];

export const has = (key: object, value: string): boolean =>
  Object.prototype.hasOwnProperty.call(key, value);

export const isValidExtension = (path: string): boolean => {
  const extension = extname(path);
  return validExtensions.findIndex((ext) => ext === extension) !== -1;
};

export const normalizedPath = (finalPath: string): string | null => {
  let extensions = [...validExtensions];

  // check if directory
  if (existsSync(finalPath)) {
    extensions = extensions.map((ext) => `/index${ext}`);
  }

  for (let i = 0; i < extensions.length; i++) {
    const finalPathWithExt = `${finalPath}${extensions[i]}`;
    const exits = existsSync(finalPathWithExt);

    if (exits) return finalPathWithExt;
  }

  return null;
};
