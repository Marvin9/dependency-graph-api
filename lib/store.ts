import { has } from './utils';

export interface StoreType {
  visitedFiles: {
    [path: string]: boolean;
  };
  dependencyGraph: {
    [source: string]: string[];
  };
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
    Store.dependencyGraph[source] = [...Store.dependencyGraph[source], target];
  } else {
    Store.dependencyGraph = {
      ...Store.dependencyGraph,
      [source]: [target],
    };
  }
};
