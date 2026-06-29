import { describe, it, expect } from 'vitest';
import { boldMarkdownToHtml } from './index';

describe('boldMarkdownToHtml', () => {
  it('converts a single **bold** segment to a <strong> tag', () => {
    expect(boldMarkdownToHtml('The **Engineering** department')).toBe(
      'The <strong>Engineering</strong> department',
    );
  });

  it('converts multiple bold segments in one string', () => {
    expect(boldMarkdownToHtml('**Alice** earns **$120,000**')).toBe(
      '<strong>Alice</strong> earns <strong>$120,000</strong>',
    );
  });

  it('returns plain text unchanged when no bold markers present', () => {
    const text = 'No formatting here at all';
    expect(boldMarkdownToHtml(text)).toBe(text);
  });

  it('handles an empty string without throwing', () => {
    expect(boldMarkdownToHtml('')).toBe('');
  });

  it('handles bold text at the very start of the string', () => {
    expect(boldMarkdownToHtml('**Total** payroll spend')).toBe(
      '<strong>Total</strong> payroll spend',
    );
  });

  it('handles bold text at the very end of the string', () => {
    expect(boldMarkdownToHtml('Average salary is **$95,000 USD**')).toBe(
      'Average salary is <strong>$95,000 USD</strong>',
    );
  });

  it('handles a string that is entirely bold', () => {
    expect(boldMarkdownToHtml('**$1,234,567**')).toBe('<strong>$1,234,567</strong>');
  });

  it('does not modify unmatched single asterisks', () => {
    const text = 'salary * 1.08 = USD value';
    expect(boldMarkdownToHtml(text)).toBe(text);
  });
});
