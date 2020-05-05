import { has } from './utils';

export type dependencyGraphType = {
  [source: string]: string[];
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
    const findAlready = Store.dependencyGraph[source].findIndex(
      (tg) => tg === target
    );

    if (findAlready !== -1) return;

    Store.dependencyGraph[source] = [...Store.dependencyGraph[source], target];
  } else {
    Store.dependencyGraph = {
      ...Store.dependencyGraph,
      [source]: [target],
    };
  }
};
