import { Store, dependencyGraphType } from "./store";
import { GenerateNode } from "./helpers/generateNode";
import { TraverseStatements } from "./helpers/ASTTraverse";

export const generateGraph = (
  rootFolder: string,
  entryFile: string
): dependencyGraphType | null => {
  const Chunk = GenerateNode(rootFolder, entryFile, true);

  let node, finalPath: string;
  if (Chunk) {
    [node, finalPath] = Chunk;
  } else return null;

  TraverseStatements(node, finalPath);

  const { dependencyGraph } = Store;
  Store.dependencyGraph = {};
  Store.visitedFiles = {};

  return dependencyGraph;
};
