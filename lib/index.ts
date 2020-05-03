import { writeFileSync } from 'fs';

import { Store } from './store';
import { GenerateNode } from './helpers/generateNode';
import { TraverseStatements } from './helpers/ASTTraverse';

if (process.argv.length >= 3) {
  const [, , indexFile] = process.argv;
  const Chunk = GenerateNode(process.cwd(), indexFile, true);

  let node, finalPath: string;
  if (Chunk) {
    [node, finalPath] = Chunk;
  }

  TraverseStatements(node, finalPath);
  // console.log(Store.visitedFiles);
  // console.log(Store.dependencyGraph);
}
