import * as ts from 'typescript';
import { basename, dirname, extname, resolve } from 'path';
import { existsSync, readFileSync } from 'fs';

import { normalizedPath } from '../utils';
import { addToDependencyGraph } from '../store';

export const GenerateNode = (
  src: string,
  path: string,
  root?: boolean
): [ts.SourceFile, string] | null => {
  let srcDir;
  if (root) srcDir = src;
  else srcDir = dirname(src);

  let finalPath = resolve(srcDir, path);

  // I thought of ignoring extensions like .svg, .png
  // but below one is ignoring without extension too. like import foo from './bar';
  // where bar can be bar.ts, bar.tsx
  // if (!isValidExtension(finalPath)) return null;

  const baseName = basename(finalPath);
  let checkFileExistance = true;

  // './App' for App.tsx/ts/js/jsx or 'path/to/foo' for foo.tsx/ts/js/jsx
  if (!extname(finalPath)) {
    finalPath = normalizedPath(finalPath);

    // It means it is either external library.
    if (!finalPath) {
      // external lib validation will be done in future through package.json
      addToDependencyGraph(src, path);
      return null;
    }
    checkFileExistance = false;
  }

  let fileExists = true;
  if (checkFileExistance) {
    fileExists = existsSync(finalPath);
  }

  if (fileExists) {
    // if everything is correct, add to dependency graph
    addToDependencyGraph(src, finalPath);

    const read = readFileSync(finalPath, 'utf8');
    const node = ts.createSourceFile(baseName, read, ts.ScriptTarget.Latest);
    return [node, finalPath];
  }
  console.error(`File does not exist: ${finalPath}`);
  return null;
};
