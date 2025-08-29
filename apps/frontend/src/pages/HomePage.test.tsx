import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '../test/utils';
import HomePage from './HomePage';

// Mock the CombosGrid component
vi.mock('../components/combos/CombosGrid', () => ({
  default: () =>
    React.createElement('div', { 'data-testid': 'combos-grid' }, 'Combos Grid Component'),
}));

describe('HomePage', () => {
  it('renders the header with Club+ logo and navigation', () => {
    render(<HomePage />);

    // Check for logo and title
    expect(screen.getByAltText('Club+ Logo')).toBeInTheDocument();
    // Use getAllByText to handle multiple "Club+" elements
    const clubPlusTitles = screen.getAllByText('Club+');
    expect(clubPlusTitles.length).toBeGreaterThan(0);

    // Check for navigation buttons specifically in header
    const headerButtons = screen.getAllByRole('link');
    const loginLinks = headerButtons.filter(link => link.textContent?.includes('Iniciar Sesión'));
    const registerLinks = headerButtons.filter(link => link.textContent?.includes('Registrarse'));

    expect(loginLinks.length).toBeGreaterThan(0);
    expect(registerLinks.length).toBeGreaterThan(0);
  });

  it('renders the hero section with main content', () => {
    render(<HomePage />);

    expect(screen.getByText(/suscripciones digitales compartidas/i)).toBeInTheDocument();
    // Look for the specific text in the hero heading
    expect(screen.getByText(/accede a tus plataformas/i)).toBeInTheDocument();
    expect(screen.getByText(/favoritas/i)).toBeInTheDocument();
  });

  it('renders the CombosGrid component', () => {
    render(<HomePage />);

    expect(screen.getByTestId('combos-grid')).toBeInTheDocument();
  });

  it('renders the features section', () => {
    render(<HomePage />);

    // Check for features section
    expect(screen.getByText(/todo lo que necesitas/i)).toBeInTheDocument();
  });

  it('renders the footer with links', () => {
    render(<HomePage />);

    expect(screen.getByText(/© 2024 club\+/i)).toBeInTheDocument();
  });

  it('renders the combos section', () => {
    render(<HomePage />);

    expect(screen.getByText(/nuestros combos/i)).toBeInTheDocument();
    expect(screen.getByTestId('combos-grid')).toBeInTheDocument();
  });

  it('has proper navigation links with correct attributes', () => {
    render(<HomePage />);

    // Find all links and filter by href instead of text to avoid duplicates
    const allLinks = screen.getAllByRole('link');
    const loginLink = allLinks.find(link => link.getAttribute('href') === '/login');
    const registerLink = allLinks.find(link => link.getAttribute('href') === '/register');

    expect(loginLink).toBeInTheDocument();
    expect(registerLink).toBeInTheDocument();
  });
});
