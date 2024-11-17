import { createAnalyzer } from '../src';

describe('ComponentUsageAnalyzer', () => {
  it('should create analyzer with default options', () => {
    const analyzer = createAnalyzer();
    expect(analyzer).toBeDefined();
  });

  // Add more tests...
});
