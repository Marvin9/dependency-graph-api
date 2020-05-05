import { has } from './utils';

export type dependencyGraphType = {
  [source: string]: Set<string>;
};

export interface StoreType {
  visitedFiles: {
    [path: string]: boolean;
  };
  dependencyGraph: dependencyGraphType;
}

export const Store: StoreType = {
  visitedFiles: {},
  dependencyGraph: {},
};

export const addVisitedFile = (filePath: string): void => {
  Store.visitedFiles = {
    ...Store.visitedFiles,
    [filePath]: true,
  };
};

export const addToDependencyGraph = (source: string, target: string): void => {
  if (has(Store.dependencyGraph, source)) {
    Store.dependencyGraph[source].add(target);
  } else {
    Store.dependencyGraph = {
      ...Store.dependencyGraph,
      [source]: new Set(),
    };
    Store.dependencyGraph[source].add(target);
  }
};
