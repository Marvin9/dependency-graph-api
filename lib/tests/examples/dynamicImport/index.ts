const lazy = (fn: Function): void => fn();

lazy(() => import('./ref'));
