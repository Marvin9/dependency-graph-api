import * as ts from 'typescript';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { basename, dirname, extname, resolve } from 'path';

type baseType = ts.Node;

let visitedFiles = {};

type dependencyGraphType = {
  [node: string]: string[];
};

let dependencyGraph: dependencyGraphType = {};

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

const has = (key: object, value: string): boolean =>
  Object.prototype.hasOwnProperty.call(key, value);

const addToDependencyGraph = (node: string, child: string): void => {
  if (has(dependencyGraph, node)) {
    dependencyGraph[node] = [...dependencyGraph[node], child];
  } else {
    dependencyGraph = {
      ...dependencyGraph,
      [node]: [child],
    };
  }
};

const isValidExtension = (path: string): boolean => {
  const extension = extname(path);
  return validExtensions.findIndex((ext) => ext === extension) !== -1;
};

const GenerateNode = (
  src: string,
  path: string,
  root?: boolean
): [ts.SourceFile, string] | null => {
  let srcDir;
  if (root) srcDir = src;
  else srcDir = dirname(src);

  let finalPath = resolve(srcDir, path);
  if (!isValidExtension) return null;

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

const IterateStatements = (node: ts.SourceFile, finalPath: string): void => {
  // Check if already visited
  if (has(visitedFiles, finalPath)) return;

  // console.log(finalPath);
  //
  // Iteration calls this function therefore there are chances of infinite recursion
  // To prevent that, make sure to check visit of file
  visitedFiles = {
    ...visitedFiles,
    [finalPath]: true,
  };

  node.forEachChild((child) => {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    Iteration(child as baseType, finalPath);
  });

  // node.statements.forEach((statement) => {
  //   // eslint-disable-next-line @typescript-eslint/no-use-before-define
  //   Iteration(statement as baseType, finalPath);
  // });
};

const importResolve = (src: string, modulePath: string): void => {
  const newImportNode = GenerateNode(src, modulePath);
  if (newImportNode) {
    IterateStatements(newImportNode[0], newImportNode[1]);
  } else {
    return;
  }
};

const Iteration = (node: baseType, path: string): void => {
  if (!node) return;

  switch ((node as ts.Node).kind) {
    case ts.SyntaxKind.QualifiedName:
      Iteration((node as ts.QualifiedName).left, path);
      Iteration((node as ts.QualifiedName).right, path);
      break;

    case ts.SyntaxKind.ComputedPropertyName:
      Iteration((node as ts.ComputedPropertyName).expression, path);
      break;

    case ts.SyntaxKind.Parameter:
      Iteration((node as ts.ParameterDeclaration).type, path);
      Iteration((node as ts.ParameterDeclaration).initializer, path);
      break;

    case ts.SyntaxKind.MethodDeclaration:
      Iteration((node as ts.MethodDeclaration).body, path);
      break;

    case ts.SyntaxKind.Constructor:
      Iteration((node as ts.ConstructorDeclaration).body, path);
      break;

    case ts.SyntaxKind.GetAccessor:
    case ts.SyntaxKind.SetAccessor:
      Iteration((node as ts.GetAccessorDeclaration).body, path);
      break;

    case ts.SyntaxKind.ArrayLiteralExpression:
      (node as ts.ArrayLiteralExpression).elements.forEach((element) =>
        Iteration(element, path)
      );
      break;

    case ts.SyntaxKind.ObjectLiteralExpression:
      (node as ts.ObjectLiteralExpression).properties.forEach((property) =>
        Iteration(property, path)
      );
      break;

    case ts.SyntaxKind.PropertyAccessExpression:
    case ts.SyntaxKind.ElementAccessExpression:
    case ts.SyntaxKind.CallExpression:
    case ts.SyntaxKind.NewExpression:
    case ts.SyntaxKind.ExpressionWithTypeArguments:
    case ts.SyntaxKind.ExpressionStatement:
    case ts.SyntaxKind.ReturnStatement:
    case ts.SyntaxKind.ThrowStatement: {
      if (
        (node as ts.CallExpression).expression &&
        (node as ts.CallExpression).expression.kind ===
          ts.SyntaxKind.ImportKeyword
      ) {
        // import('foo');
        const modulePath = ((node as ts.CallExpression)
          .arguments[0] as ts.StringLiteral).text;

        if (modulePath) {
          importResolve(path, modulePath);
        }
      }

      if (
        (node as ts.CallExpression) &&
        (node as ts.CallExpression).arguments
      ) {
        (node as ts.CallExpression).arguments.forEach((arg) =>
          Iteration(arg, path)
        );
      }

      Iteration(
        (node as
          | ts.PropertyAccessExpression
          | ts.ElementAccessExpression
          | ts.CallExpression
          | ts.NewExpression
          | ts.ExpressionWithTypeArguments
          | ts.ExpressionStatement
          | ts.ReturnStatement).expression,
        path
      );
      break;
    }

    case ts.SyntaxKind.FunctionExpression:
    case ts.SyntaxKind.ArrowFunction:
      (node as
        | ts.FunctionExpression
        | ts.ArrowFunction).parameters.forEach((parameter) =>
        Iteration(parameter, path)
      );
      Iteration((node as ts.FunctionExpression | ts.ArrowFunction).body, path);
      break;

    case ts.SyntaxKind.BinaryExpression:
      Iteration((node as ts.BinaryExpression).left, path);
      Iteration((node as ts.BinaryExpression).right, path);
      break;

    case ts.SyntaxKind.ConditionalExpression:
      Iteration((node as ts.ConditionalExpression).whenTrue, path);
      Iteration((node as ts.ConditionalExpression).whenFalse, path);
      break;

    case ts.SyntaxKind.ClassExpression:
    case ts.SyntaxKind.ClassDeclaration:
      (node as
        | ts.ClassExpression
        | ts.ClassDeclaration).members.forEach((member) =>
        Iteration(member, path)
      );
      break;

    case ts.SyntaxKind.Block:
      (node as ts.Block).statements.forEach((statement) =>
        Iteration(statement, path)
      );
      break;

    case ts.SyntaxKind.VariableStatement:
      Iteration((node as ts.VariableStatement).declarationList, path);
      break;

    case ts.SyntaxKind.IfStatement:
      Iteration((node as ts.IfStatement).expression, path);
      Iteration((node as ts.IfStatement).thenStatement, path);
      Iteration((node as ts.IfStatement).elseStatement, path);
      break;

    case ts.SyntaxKind.DoStatement:
      Iteration((node as ts.DoStatement).statement, path);
      Iteration((node as ts.DoStatement).expression, path);
      break;

    case ts.SyntaxKind.WhileStatement:
    case ts.SyntaxKind.WithStatement:
      Iteration(
        (node as ts.WhileStatement | ts.WithStatement).expression,
        path
      );
      Iteration((node as ts.WhileStatement | ts.WithStatement).statement, path);
      break;

    case ts.SyntaxKind.ForStatement:
    case ts.SyntaxKind.ForInStatement:
    case ts.SyntaxKind.ForOfStatement:
      Iteration(
        (node as ts.ForStatement | ts.ForInOrOfStatement).statement,
        path
      );
      break;

    case ts.SyntaxKind.SwitchStatement:
      Iteration((node as ts.SwitchStatement).expression, path);
      Iteration((node as ts.SwitchStatement).caseBlock, path);
      break;

    case ts.SyntaxKind.TryStatement:
      Iteration((node as ts.TryStatement).tryBlock, path);
      Iteration((node as ts.TryStatement).catchClause, path);
      Iteration((node as ts.TryStatement).finallyBlock, path);
      break;

    case ts.SyntaxKind.VariableDeclaration:
      Iteration((node as ts.VariableDeclaration).initializer, path);
      break;

    case ts.SyntaxKind.VariableDeclarationList:
      (node as ts.VariableDeclarationList).declarations.forEach((declaration) =>
        Iteration(declaration, path)
      );
      break;

    case ts.SyntaxKind.FunctionDeclaration:
    case ts.SyntaxKind.ModuleDeclaration:
      Iteration(
        (node as ts.FunctionDeclaration | ts.ModuleDeclaration).body,
        path
      );
      break;

    case ts.SyntaxKind.ModuleBlock:
      (node as ts.ModuleBlock).statements.forEach((st) => Iteration(st, path));
      break;

    case ts.SyntaxKind.CaseBlock:
      (node as ts.CaseBlock).clauses.forEach((clause) =>
        Iteration(clause, path)
      );
      break;

    case ts.SyntaxKind.ImportEqualsDeclaration:
      console.error('ImportEqualsDeclaration still needs to be implemented');
      break;

    case ts.SyntaxKind.ImportDeclaration: {
      const { importClause } = node as ts.ImportDeclaration;
      let modulePath;
      if (
        (node as ts.ImportDeclaration).moduleSpecifier &&
        ((node as ts.ImportDeclaration).moduleSpecifier as ts.StringLiteral)
          .text
      ) {
        modulePath = ((node as ts.ImportDeclaration)
          .moduleSpecifier as ts.StringLiteral).text;
      } else return;

      importResolve(path, modulePath);

      if (!importClause) break;

      if (importClause.name) {
        // import foo from 'bar';
      } else if (importClause.namedBindings) {
        // import { foo, bar } from 'baz';
      }
      break;
    }

    case ts.SyntaxKind.ExportDeclaration: {
      let modulePath;
      if (
        (node as ts.ImportDeclaration).moduleSpecifier &&
        ((node as ts.ImportDeclaration).moduleSpecifier as ts.StringLiteral)
          .text
      ) {
        modulePath = ((node as ts.ExportDeclaration)
          .moduleSpecifier as ts.StringLiteral).text;
      } else return;

      importResolve(path, modulePath);

      break;
    }

    case ts.SyntaxKind.ExportAssignment:
      break;
  }
};

if (process.argv.length >= 3) {
  const [, , indexFile] = process.argv;
  const Chunk = GenerateNode(process.cwd(), indexFile, true);

  let node, finalPath: string;
  if (Chunk) {
    [node, finalPath] = Chunk;
  }

  IterateStatements(node, finalPath);
  // console.log(visitedFiles);
  writeFileSync('depGraph.json', JSON.stringify(dependencyGraph, null, ' '));
  // console.log(dependencyGraph);
}
