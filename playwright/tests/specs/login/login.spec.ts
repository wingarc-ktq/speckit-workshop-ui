import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { testUsers } from '../../fixtures/testUsers';

test.describe('ログイン', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    await loginPage.navigate();
  });

  test('有効な認証情報でログインできること', async ({ page }) => {
    // 1. ログインページにアクセスする（beforeEachで実行済み）

    // 2. メールアドレスに test@example.com を入力する
    await loginPage.fillEmail(testUsers.validUser.email);

    // 3. パスワードに password123 を入力する
    await loginPage.fillPassword(testUsers.validUser.password);

    // 4. 「ログイン」ボタンをクリックする
    await loginPage.clickLoginButton();

    // 5. マイファイル（ダッシュボード）ページに遷移すること
    await expect(page).toHaveURL('/');

    // 6. 「最近使用したファイル」という見出しが表示されること
    await expect(await dashboardPage.getDashboardHeading()).toBeVisible();
  });

  test('ログイン状態を記録するチェックボックスが機能すること', async ({
    page,
  }) => {
    // 1. ログインページにアクセスする（beforeEachで実行済み）

    // 2. メールアドレスに test@example.com を入力する
    await loginPage.fillEmail(testUsers.validUser.email);

    // 3. パスワードに password123 を入力する
    await loginPage.fillPassword(testUsers.validUser.password);

    // 4. 「ログイン状態を記録する」チェックボックスをチェックする
    await loginPage.checkRememberMe();

    // 5. チェックボックスがチェック状態になること
    const checkbox = page.getByRole('checkbox', {
      name: 'ログイン状態を記録する',
    });
    await expect(checkbox).toBeChecked();

    // 6. 「ログイン」ボタンをクリックする
    await loginPage.clickLoginButton();

    // 7. マイファイル（ダッシュボード）ページに遷移すること
    await expect(page).toHaveURL('/');
  });
});
