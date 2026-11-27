import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, type MemoryRouterProps } from 'react-router-dom';
import '@/i18n';

// Mock the axios wrapper so login resolves without a server.
const { mockPost, mockGet } = vi.hoisted(() => ({ mockPost: vi.fn(), mockGet: vi.fn() }));
vi.mock('@/services/api', () => ({
  default: {
    post: mockPost,
    get: mockGet,
    defaults: { headers: { common: {} } },
  },
}));

import { AuthProvider, useAuth } from '@/hooks/useAuth';

const loginResponse = {
  data: {
    token: 'test-jwt',
    user: {
      id: 'u1',
      email: 'user@example.com',
      name: 'Normal User',
      role: 'USER',
      userTier: 'FREE',
      creditBalance: 10,
    },
  },
};

// Small page that triggers login on demand.
const LoginProbe = () => {
  const { login } = useAuth();
  return (
    <button onClick={() => void login('user@example.com', 'secret').catch(() => {})}>
      Do login
    </button>
  );
};

const renderAt = (initialEntry: string | { pathname: string; state?: unknown }) =>
  render(
    <MemoryRouter initialEntries={[initialEntry] as MemoryRouterProps['initialEntries']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginProbe />} />
          <Route path="/profile" element={<div>PROFILE PAGE</div>} />
          <Route path="/my-coupons" element={<div>MY COUPONS PAGE</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

describe('useAuth post-login redirect', () => {
  beforeEach(() => {
    localStorage.clear();
    mockPost.mockReset();
    mockGet.mockReset();
    mockPost.mockResolvedValue(loginResponse);
    mockGet.mockResolvedValue({ data: { user: loginResponse.data.user } });
  });

  it('sends the user to /profile after a successful login', async () => {
    renderAt('/login');

    fireEvent.click(screen.getByRole('button', { name: /do login/i }));

    await waitFor(() => expect(screen.getByText('PROFILE PAGE')).toBeInTheDocument());
  });

  it('returns the user to the protected page they came from', async () => {
    renderAt({ pathname: '/login', state: { from: { pathname: '/my-coupons', search: '' } } });

    fireEvent.click(screen.getByRole('button', { name: /do login/i }));

    await waitFor(() => expect(screen.getByText('MY COUPONS PAGE')).toBeInTheDocument());
  });
});
