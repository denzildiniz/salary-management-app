import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Users } from 'lucide-react';
import { StatCard } from './StatCard';

describe('StatCard', () => {
  const defaultProps = {
    label: 'Total Headcount',
    value: '10,000',
    subtext: 'across 6 countries',
    icon: <Users className="w-5 h-5" />,
    iconBg: 'bg-indigo-500/20',
  };

  it('renders the label text', () => {
    render(<StatCard {...defaultProps} />);
    expect(screen.getByText('Total Headcount')).toBeInTheDocument();
  });

  it('renders the value prominently', () => {
    render(<StatCard {...defaultProps} />);
    expect(screen.getByText('10,000')).toBeInTheDocument();
  });

  it('renders the subtext', () => {
    render(<StatCard {...defaultProps} />);
    expect(screen.getByText('across 6 countries')).toBeInTheDocument();
  });

  it('applies the iconBg class to the icon wrapper', () => {
    const { container } = render(<StatCard {...defaultProps} />);
    const iconWrapper = container.querySelector('.bg-indigo-500\\/20');
    expect(iconWrapper).toBeInTheDocument();
  });

  it('renders different values correctly', () => {
    render(<StatCard {...defaultProps} label="Avg Salary" value="$95,420" subtext="USD equivalent" />);
    expect(screen.getByText('Avg Salary')).toBeInTheDocument();
    expect(screen.getByText('$95,420')).toBeInTheDocument();
    expect(screen.getByText('USD equivalent')).toBeInTheDocument();
  });
});
