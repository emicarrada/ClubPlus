import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { CombosGrid } from './CombosGrid';

// Mock the API hooks
vi.mock('../../hooks/useApi', () => ({
  useComboTemplates: vi.fn().mockReturnValue({
    data: [
      {
        id: '1',
        name: 'Combo Entretenimiento',
        description: 'Disney+ y HBO Max',
        price: 199,
        duration: 30,
        platforms: ['disney-plus', 'hbo-max'],
        isPopular: true,
      },
      {
        id: '2',
        name: 'Combo Creativo',
        description: 'Canva Pro incluido',
        price: 299,
        duration: 30,
        platforms: ['canva-pro'],
        isPopular: false,
      },
    ],
    isLoading: false,
    error: null,
  }),
  useCreateCombo: vi.fn().mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('CombosGrid Component', () => {
  it('renders successfully', () => {
    render(
      <TestWrapper>
        <CombosGrid />
      </TestWrapper>,
    );

    expect(screen.getByText('Combo Entretenimiento')).toBeInTheDocument();
    expect(screen.getByText('Combo Creativo')).toBeInTheDocument();
  });
});
