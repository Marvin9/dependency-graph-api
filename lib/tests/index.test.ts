import * as path from 'path';

import { Store, dependencyGraphType } from '../store';
import { generateGraph } from '../index';

beforeEach(() => {
  Store.dependencyGraph = {};
});

type exampleType = [string, string, dependencyGraphType];

describe('generateGraph', () => {
  it('should return null for invalid file path', () => {
    expect(generateGraph('some', 'fake')).toBeNull();
  });

  it('should return correct dependency graph', () => {
    const examples = path.resolve(process.cwd(), './lib/tests/examples');

    const tests: exampleType[] = [
      [
        'simple',
        'index.ts',
        {
          [`${examples}/simple`]: [`${examples}/simple/index.ts`],
          [`${examples}/simple/index.ts`]: [`${examples}/simple/ref.ts`],
        },
      ],
      [
        'moderate',
        'index.ts',
        {
          [`${examples}/moderate`]: [`${examples}/moderate/index.ts`],
          [`${examples}/moderate/index.ts`]: [
            `${examples}/moderate/ref.ts`,
            `${examples}/moderate/furtherRefs/ref.ts`,
          ],
          [`${examples}/moderate/furtherRefs/ref.ts`]: [
            `${examples}/moderate/furtherRefs/refsref.ts`,
          ],
        },
      ],
      [
        'dynamicImport',
        'index.ts',
        {
          [`${examples}/dynamicImport`]: [`${examples}/dynamicImport/index.ts`],
          [`${examples}/dynamicImport/index.ts`]: [
            `${examples}/dynamicImport/ref.ts`,
          ],
        },
      ],
      [
        'complex',
        'index.ts',
        {
          [`${examples}/complex`]: [`${examples}/complex/index.ts`],
          [`${examples}/complex/index.ts`]: [
            `${examples}/complex/foos/index.ts`,
            `${examples}/complex/refs/index.ts`,
          ],
          [`${examples}/complex/foos/index.ts`]: [
            `${examples}/complex/refs/index.ts`,
          ],
          [`${examples}/complex/refs/index.ts`]: [`${examples}/complex/foo.ts`],
        },
      ],
    ];

    tests.forEach((example) => {
      const resolved = `${examples}/${example[0]}`;

      const graph = generateGraph(resolved, example[1]);
      expect(graph).toStrictEqual(example[2]);
    });
  });
});
