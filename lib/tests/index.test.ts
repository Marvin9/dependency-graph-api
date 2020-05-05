import { Store } from '../store';
import { generateGraph } from '../index';

import { examples, integrationTest } from './constants';

beforeEach(() => {
  Store.dependencyGraph = {};
});

describe('generateGraph', () => {
  it('should return null for invalid file path', () => {
    expect(generateGraph('some', 'fake')).toBeNull();
  });

  it('should return correct dependency graph', () => {
    integrationTest.forEach((example) => {
      const resolved = `${examples}/${example[0]}`;

      const graph = generateGraph(resolved, example[1]);
      expect(graph).toStrictEqual(example[2]);
    });
  });
});
