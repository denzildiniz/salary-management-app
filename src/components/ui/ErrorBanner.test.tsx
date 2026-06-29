import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBanner } from './ErrorBanner';

describe('ErrorBanner', () => {
  it('renders the error message', () => {
    render(<ErrorBanner message="Failed to load employees" />);
    expect(screen.getByText('Failed to load employees')).toBeInTheDocument();
  });

  it('renders the "Error" heading', () => {
    render(<ErrorBanner message="Something went wrong" />);
    expect(screen.getByRole('heading', { name: 'Error' })).toBeInTheDocument();
  });

  it('does not render a Retry button when onRetry is not provided', () => {
    render(<ErrorBanner message="Network error" />);
    expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
  });

  it('renders a Retry button when onRetry is provided', () => {
    render(<ErrorBanner message="Network error" onRetry={() => {}} />);
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('calls onRetry when the Retry button is clicked', async () => {
    const onRetry = vi.fn();
    render(<ErrorBanner message="Network error" onRetry={onRetry} />);
    await userEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders different error messages correctly', () => {
    render(<ErrorBanner message="CORS policy blocked the request" />);
    expect(screen.getByText('CORS policy blocked the request')).toBeInTheDocument();
  });
});
