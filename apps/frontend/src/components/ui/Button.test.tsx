import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '../../test/utils';
import Button from './Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('applies primary variant styles by default', () => {
    render(<Button>Primary Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-primary', 'text-secondary');
  });

  it('applies ghost variant styles', () => {
    render(<Button variant='ghost'>Ghost Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('text-primary', 'hover:bg-gray-light');
  });

  it('shows loading state correctly', () => {
    render(<Button isLoading>Loading Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    // Check for loading text specifically in the visible content (not screen reader)
    expect(button).toHaveTextContent('Cargando...');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('calls onClick handler when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Clickable Button</Button>);
    const button = screen.getByRole('button');

    await user.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(
      <Button onClick={handleClick} disabled>
        Disabled Button
      </Button>,
    );
    const button = screen.getByRole('button');

    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<Button className='custom-class'>Custom Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });
});
