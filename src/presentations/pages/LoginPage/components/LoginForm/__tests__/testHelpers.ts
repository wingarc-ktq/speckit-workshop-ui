import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * ログインフォームの入力フィールドを取得する
 */
export const getLoginFormElements = () => {
  const emailInput = screen.getByLabelText(/メールアドレス/i);
  const passwordInput = screen.getByLabelText(/パスワード/i);
  const rememberMeCheckbox = screen.getByLabelText(/ログイン状態を記録する/i);
  const submitButton = screen.getByRole('button', { name: /ログイン/i });

  return {
    emailInput,
    passwordInput,
    rememberMeCheckbox,
    submitButton,
  };
};

/**
 * ログインフォームに値を入力する
 */
export const fillLoginForm = async (credentials: {
  email: string;
  password: string;
  rememberMe: boolean;
}) => {
  const user = userEvent.setup();
  const { emailInput, passwordInput, rememberMeCheckbox } =
    getLoginFormElements();

  if (credentials.email) {
    await user.clear(emailInput);
    await user.type(emailInput, credentials.email);
  }

  if (credentials.password) {
    await user.clear(passwordInput);
    await user.type(passwordInput, credentials.password);
  }

  if (credentials.rememberMe) {
    await user.click(rememberMeCheckbox);
  }
};

/**
 * ログインボタンをクリックする
 */
export const clickLoginButton = async () => {
  const user = userEvent.setup();
  const submitButton = screen.getByRole('button', { name: /ログイン/i });
  await user.click(submitButton);
};
