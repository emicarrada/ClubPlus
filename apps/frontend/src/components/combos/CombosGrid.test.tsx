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
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        platforms: [
          { id: 'disney-plus', name: 'Disney+', logoUrl: '/logos/disney-plus.svg' },
          { id: 'hbo-max', name: 'HBO Max', logoUrl: '/logos/hbo-max.svg' },
        ],
      },
      {
        id: '2',
        name: 'Combo Creativo',
        description: 'Canva Pro incluido',
        price: 299,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        platforms: [{ id: 'canva-pro', name: 'Canva Pro', logoUrl: '/logos/canva-pro.svg' }],
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
