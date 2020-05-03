import { GenerateNode } from './generateNode';
import { TraverseStatements } from './ASTTraverse';

export const importResolve = (src: string, modulePath: string): void => {
  const newImportNode = GenerateNode(src, modulePath);
  if (newImportNode) {
    TraverseStatements(newImportNode[0], newImportNode[1]);
  } else {
    return;
  }
};
