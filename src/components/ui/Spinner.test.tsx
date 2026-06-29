import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('renders without crashing', () => {
    const { container } = render(<Spinner />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('shows the label text when provided', () => {
    render(<Spinner label="Loading employees..." />);
    expect(screen.getByText('Loading employees...')).toBeInTheDocument();
  });

  it('does not render a label element when label prop is omitted', () => {
    render(<Spinner />);
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
  });

  it('applies the sm size class', () => {
    const { container } = render(<Spinner size="sm" />);
    const spinner = container.querySelector('.w-4');
    expect(spinner).toBeInTheDocument();
  });

  it('applies the md size class by default', () => {
    const { container } = render(<Spinner />);
    const spinner = container.querySelector('.w-8');
    expect(spinner).toBeInTheDocument();
  });

  it('applies the lg size class', () => {
    const { container } = render(<Spinner size="lg" />);
    const spinner = container.querySelector('.w-12');
    expect(spinner).toBeInTheDocument();
  });

  it('always includes the animate-spin class', () => {
    const { container } = render(<Spinner />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });
});
