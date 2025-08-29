import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '../../test/utils';
import Input from './Input';

describe('Input Component', () => {
  it('renders with correct placeholder', () => {
    render(<Input placeholder='Enter your email' />);
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Input label='Email Address' />);
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
  });

  it('shows error state with error message', () => {
    render(<Input label='Email' error='Email is required' />);
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    const input = screen.getByLabelText('Email');
    expect(input).toHaveClass('input-error');
  });

  it('shows success state', () => {
    render(<Input label='Email' success />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveClass('input-success');
  });

  it('handles user input correctly', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Input placeholder='Type here' onChange={handleChange} />);
    const input = screen.getByPlaceholderText('Type here');

    await user.type(input, 'Hello World');
    expect(handleChange).toHaveBeenCalled();
    expect(input).toHaveValue('Hello World');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Input placeholder='Disabled input' disabled />);
    const input = screen.getByPlaceholderText('Disabled input');
    expect(input).toBeDisabled();
  });

  it('applies custom className', () => {
    render(<Input placeholder='Custom input' className='custom-class' />);
    const input = screen.getByPlaceholderText('Custom input');
    expect(input).toHaveClass('custom-class');
  });

  it('supports different input types', () => {
    render(<Input type='password' placeholder='Password' />);
    const input = screen.getByPlaceholderText('Password');
    expect(input).toHaveAttribute('type', 'password');
  });
});
