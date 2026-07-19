import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * ログインページのPage Object
 */
export class LoginPage extends BasePage {
  readonly url = '/login';

  constructor(page: Page) {
    super(page);
  }

  /**
   * メールアドレスを入力
   */
  async fillEmail(email: string) {
    await this.page
      .getByRole('textbox', { name: 'メールアドレス' })
      .fill(email);
  }

  /**
   * パスワードを入力
   */
  async fillPassword(password: string) {
    await this.page.getByRole('textbox', { name: 'パスワード' }).fill(password);
  }

  /**
   * ログイン状態を記録するチェックボックスをチェック
   */
  async checkRememberMe() {
    await this.page
      .getByRole('checkbox', { name: 'ログイン状態を記録する' })
      .check();
  }

  /**
   * ログインボタンをクリック
   */
  async clickLoginButton() {
    await this.page.getByRole('button', { name: 'ログイン' }).click();
  }

  /**
   * ログイン処理を実行
   */
  async login(email: string, password: string, rememberMe = false) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    if (rememberMe) {
      await this.checkRememberMe();
    }
    await this.clickLoginButton();
  }

  /**
   * ログインページが表示されているか確認
   */
  async isLoginPage() {
    return this.page
      .getByRole('heading', { name: 'ログイン', level: 1 })
      .isVisible();
  }

  /**
   * パスワード表示切替ボタンをクリック
   */
  async togglePasswordVisibility() {
    await this.page
      .getByRole('button', { name: 'togglePasswordVisibility' })
      .click();
  }

  /**
   * パスワードを忘れた場合リンクをクリック
   */
  async clickForgotPasswordLink() {
    await this.page
      .getByRole('link', { name: 'パスワードを忘れた場合' })
      .click();
  }
}
