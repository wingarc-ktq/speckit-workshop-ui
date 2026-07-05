import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';

import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';
import { i18n } from '@/i18n/config';

import {
  clickLoginButton,
  fillLoginForm,
} from '../components/LoginForm/__tests__/testHelpers';
import { LoginPage } from '../LoginPage';

describe('LoginPage', () => {
  const mockLoginUser = vi.fn();

  const renderWithRouter = () => {
    const initialEntries = ['/login'];
    return render(
      <RepositoryTestWrapper
        override={{
          auth: {
            loginUser: mockLoginUser,
          },
        }}
      >
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<div data-testid="home-page" />} />
          </Routes>
        </MemoryRouter>
      </RepositoryTestWrapper>
    );
  };

  beforeEach(() => {
    i18n.changeLanguage('ja');
  });

  test('LoginFormにpropsが正しく渡される', () => {
    const r = renderWithRouter();

    const loginButton = r.getByRole('button', { name: 'ログイン' });
    expect(loginButton).not.toBeDisabled();
  });

  test('ログインが成功すると、ホームページにリダイレクトされる', async () => {
    renderWithRouter();

    await fillLoginForm({
      userId: 'testuser@example.com',
      password: 'password123',
      rememberMe: false,
    });

    await clickLoginButton();

    expect(mockLoginUser).toHaveBeenCalledTimes(1);
    expect(mockLoginUser.mock.calls[0][0]).toEqual({
      userId: 'testuser@example.com',
      password: 'password123',
      rememberMe: false,
    });
  });
});
