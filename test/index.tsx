const l = (fn) => fn();

const Lazy = l(() => import('./y'));
