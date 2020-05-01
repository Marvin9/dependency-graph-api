import {
  createSourceFile,
  ExportAssignment,
  ExportDeclaration,
  StringLiteral,
  ImportDeclaration,
  ScriptTarget,
  SourceFile,
  SyntaxKind,
  VariableStatement,
} from 'typescript';
import { existsSync, readFileSync } from 'fs';
import { basename, dirname, extname, resolve } from 'path';

type baseType =
  | ExportAssignment
  | ImportDeclaration
  | VariableStatement
  | ExportDeclaration;

let visitedFiles = {};

const validExtensions = ['.js', '.jsx', '.ts', '.tsx'];

const normalizedPath = (finalPath: string): string | null => {
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

const isValidExtension = (path: string): boolean => {
  const extension = extname(path);
  return validExtensions.findIndex((ext) => ext === extension) !== -1;
};

const GenerateNode = (
  src: string,
  path: string
): [SourceFile, string] | null => {
  let finalPath = resolve(src, path);
  if (!isValidExtension) return null;

  const baseName = basename(finalPath);
  let checkFileExistance = true;

  // './App' for App.tsx/ts/js/jsx or 'path/to/foo' for foo.tsx/ts/js/jsx
  if (!extname(finalPath)) {
    finalPath = normalizedPath(finalPath);
    // It means it is either external library.
    if (!finalPath) return null;
    checkFileExistance = false;
  }

  let fileExists = true;
  if (checkFileExistance) {
    fileExists = existsSync(finalPath);
  }

  if (fileExists) {
    const read = readFileSync(finalPath, 'utf8');
    const node = createSourceFile(baseName, read, ScriptTarget.Latest);
    return [node, finalPath];
  }
  console.error(`File does not exist: ${finalPath}`);
  return null;
};

const has = (key: object, value: string): boolean =>
  Object.prototype.hasOwnProperty.call(key, value);

const IterateStatements = (node: SourceFile, finalPath: string): void => {
  // Check if already visited
  if (has(visitedFiles, finalPath)) return;

  console.log(finalPath);

  // Iteration calls this function therefore there are chances of infinite recursion
  // To prevent that, make sure to check visit of file
  visitedFiles = {
    ...visitedFiles,
    [finalPath]: true,
  };

  node.statements.forEach((statement) => {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    Iteration(statement as baseType, finalPath);
  });
};

const Iteration = (node: baseType, path: string): void => {
  switch (node.kind) {
    case SyntaxKind.ImportDeclaration: {
      const { importClause } = node;
      const modulePath = (node.moduleSpecifier as StringLiteral).text;

      const newNode = GenerateNode(dirname(path), modulePath);
      if (newNode) {
        IterateStatements(newNode[0], newNode[1]);
      } else {
        return;
      }

      if (!importClause) break;

      if (importClause.name) {
        // import foo from 'bar';
      } else if (importClause.namedBindings) {
        // import { foo, bar } from 'baz';
      }
      break;
    }

    case SyntaxKind.ExportDeclaration: {
      const modulePath = (node.moduleSpecifier as StringLiteral).text;

      const newNode = GenerateNode(dirname(path), modulePath);
      if (newNode) {
        console.log(newNode[1]);
        IterateStatements(newNode[0], newNode[1]);
      } else {
        return;
      }
      break;
    }

    case SyntaxKind.VariableStatement:
      break;

    case SyntaxKind.ExportAssignment:
      break;
  }
};

if (process.argv.length >= 3) {
  const [, , indexFile] = process.argv;
  const Chunk = GenerateNode(process.cwd(), indexFile);

  let node, finalPath: string;
  if (Chunk) {
    [node, finalPath] = Chunk;
  }

  IterateStatements(node, finalPath);
}
