import { createAnalyzer } from '../src/index.js';

describe('ComponentUsageAnalyzer', () => {
  it('should create analyzer with default options', () => {
    const analyzer = createAnalyzer();
    expect(analyzer).toBeDefined();
  });

  // Add more tests...
});
