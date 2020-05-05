import * as path from 'path';

import { dependencyGraphType } from '../store';

export const examples = path.resolve(process.cwd(), './lib/tests/examples');

type exampleType = [string, string, dependencyGraphType];

export const integrationTest: exampleType[] = [
  [
    'simple',
    'index.ts',
    {
      [`${examples}/simple`]: new Set([`${examples}/simple/index.ts`]),
      [`${examples}/simple/index.ts`]: new Set([`${examples}/simple/ref.ts`]),
    },
  ],
  [
    'moderate',
    'index.ts',
    {
      [`${examples}/moderate`]: new Set([`${examples}/moderate/index.ts`]),
      [`${examples}/moderate/index.ts`]: new Set([
        `${examples}/moderate/ref.ts`,
        `${examples}/moderate/furtherRefs/ref.ts`,
      ]),
      [`${examples}/moderate/furtherRefs/ref.ts`]: new Set([
        `${examples}/moderate/furtherRefs/refsref.ts`,
      ]),
    },
  ],
  [
    'dynamicImport',
    'index.ts',
    {
      [`${examples}/dynamicImport`]: new Set([
        `${examples}/dynamicImport/index.ts`,
      ]),
      [`${examples}/dynamicImport/index.ts`]: new Set([
        `${examples}/dynamicImport/ref.ts`,
      ]),
    },
  ],
  [
    'complex',
    'index.ts',
    {
      [`${examples}/complex`]: new Set([`${examples}/complex/index.ts`]),
      [`${examples}/complex/index.ts`]: new Set([
        `${examples}/complex/foos/index.ts`,
        `${examples}/complex/refs/index.ts`,
      ]),
      [`${examples}/complex/foos/index.ts`]: new Set([
        `${examples}/complex/refs/index.ts`,
      ]),
      [`${examples}/complex/refs/index.ts`]: new Set([
        `${examples}/complex/foo.ts`,
      ]),
    },
  ],
];
