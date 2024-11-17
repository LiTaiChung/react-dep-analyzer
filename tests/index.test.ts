import { createAnalyzer, UsageAnalyzer } from '../src';

describe('UsageAnalyzer', () => {
  test('should create analyzer with default options', () => {
    const analyzer = createAnalyzer();
    expect(analyzer).toBeInstanceOf(UsageAnalyzer);
  });
});
