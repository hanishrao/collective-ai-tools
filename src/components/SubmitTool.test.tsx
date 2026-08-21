import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import SubmitTool from './SubmitTool';
import { useAuth } from '../context/AuthContext';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);
const fetchMock = vi.mocked(global.fetch);

const signedInUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  avatar: '',
  role: 'user' as const,
};

function authValue(user: typeof signedInUser | null) {
  return {
    user,
    loading: false,
    login: vi.fn(),
    loginWithGoogle: vi.fn(),
    loginWithGithub: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  };
}

async function renderSubmit() {
  const view = render(
    <MemoryRouter>
      <SubmitTool />
    </MemoryRouter>
  );
  await waitFor(() => expect(fetchMock).toHaveBeenCalled());
  return view;
}

describe('SubmitTool', () => {
  beforeEach(() => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        categories: [{ _id: 'dev', name: 'Developer Tools' }],
      }),
    } as Response);
  });

  it('asks anonymous visitors to sign in', async () => {
    mockedUseAuth.mockReturnValue(authValue(null));
    await renderSubmit();
    expect(screen.getByText('Sign in to Submit')).toBeInTheDocument();
  });

  it('renders the submit form for signed-in users', async () => {
    mockedUseAuth.mockReturnValue(authValue(signedInUser));
    await renderSubmit();
    expect(screen.getByText('Submit a Resource')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Submit Resource' })
    ).toBeInTheDocument();
  });

  it('submits an AI tool and shows the success screen', async () => {
    mockedUseAuth.mockReturnValue(authValue(signedInUser));
    fetchMock.mockImplementation(async (input, init) => {
      const url = String(input);
      if (url.includes('/api/filters')) {
        return {
          ok: true,
          json: async () => ({ categories: [] }),
        } as Response;
      }
      if (url.includes('/api/submissions') && init?.method === 'POST') {
        return { ok: true, json: async () => ({}) } as Response;
      }
      return { ok: false, json: async () => ({}) } as Response;
    });

    await renderSubmit();
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText(/ChatGPT/), 'My Tool');
    await user.type(
      screen.getByPlaceholderText(/Briefly describe/),
      'Does things'
    );
    await user.type(
      screen.getByPlaceholderText('https://...'),
      'https://example.com'
    );
    await user.click(screen.getByRole('button', { name: 'Submit Resource' }));

    await waitFor(() => {
      expect(screen.getByText('Submission Received!')).toBeInTheDocument();
    });
  });
});
