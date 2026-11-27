import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@/i18n';
import { RegionProvider } from '@/contexts/RegionContext';
import SiteHeader from './SiteHeader';

// Mock the auth hook so each test can describe the visitor precisely.
const { mockUseAuth } = vi.hoisted(() => ({ mockUseAuth: vi.fn() }));
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

const renderHeader = () =>
  render(
    <MemoryRouter>
      <RegionProvider>
        <SiteHeader />
      </RegionProvider>
    </MemoryRouter>
  );

describe('SiteHeader', () => {
  beforeEach(() => {
    localStorage.clear();
    mockUseAuth.mockReset();
  });

  it('shows Log in for a logged-out visitor', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, user: null, logout: vi.fn() });

    renderHeader();

    expect(screen.getByRole('link', { name: /log in/i })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: /sign up/i })).toHaveAttribute('href', '/signup');
  });

  it('shows the signed-in state for a normal USER (name, credits and Log out)', () => {
    const logout = vi.fn();
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: {
        id: 'u1',
        email: 'jane@example.com',
        name: 'Jane Doe',
        role: 'USER',
        userTier: 'FREE',
        creditBalance: 42,
      },
      logout,
    });

    renderHeader();

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('42', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /my deals/i })).toHaveAttribute('href', '/my-coupons');
    expect(screen.getByRole('link', { name: /account/i })).toHaveAttribute('href', '/profile');
    expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument();
    // A normal USER never sees the Admin link.
    expect(screen.queryByRole('link', { name: /^admin$/i })).not.toBeInTheDocument();
  });

  it('falls back to the email when the user has no name', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: {
        id: 'u2',
        email: 'noname@example.com',
        role: 'USER',
        userTier: 'FREE',
        creditBalance: 5,
      },
      logout: vi.fn(),
    });

    renderHeader();

    expect(screen.getByText('noname@example.com')).toBeInTheDocument();
  });

  it('shows the Admin link to /admin/dashboard for an ADMIN', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: {
        id: 'u3',
        email: 'owner@example.com',
        name: 'The Owner',
        role: 'ADMIN',
        userTier: 'VIP',
        creditBalance: 100,
      },
      logout: vi.fn(),
    });

    renderHeader();

    expect(screen.getByRole('link', { name: /^admin$/i })).toHaveAttribute('href', '/admin/dashboard');
  });

  it('calls logout when Log out is clicked', () => {
    const logout = vi.fn();
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: {
        id: 'u1',
        email: 'jane@example.com',
        name: 'Jane Doe',
        role: 'USER',
        userTier: 'FREE',
        creditBalance: 0,
      },
      logout,
    });

    renderHeader();
    screen.getByRole('button', { name: /log out/i }).click();

    expect(logout).toHaveBeenCalledTimes(1);
  });
});
