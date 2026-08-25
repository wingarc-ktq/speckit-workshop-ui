import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { testUsers } from '../../fixtures/testUsers';

test.describe('ログアウト', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);

    // JWTはlocalStorage/sessionStorageに保存されるため、
    // オリジンにアクセスしてからストレージをクリアし未認証状態にする
    await loginPage.navigate();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('ログアウトでセッションをクリアしてログインにリダイレクトされること', async ({
    page,
  }) => {
    // 1. ログインページにアクセスする
    await loginPage.navigate();

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

    // 7. ユーザーメニューボタン（アバター）をクリックする
    await page.getByTestId('user-menu-button').click();

    // 8. 「ログアウト」メニューアイテムをクリックする
    await page.getByRole('menuitem', { name: 'ログアウト' }).click();

    // 9. ログインページ（/login）にリダイレクトされること
    await expect(page).toHaveURL('/login');

    // 10. ログインページの見出し「ログイン」が表示されること
    await expect(
      page.getByRole('heading', { name: 'ログイン', level: 1 })
    ).toBeVisible();
  });

  test('ログアウト後、保護されたページは再認証が必要なこと', async ({
    page,
  }) => {
    // 1. ログインページにアクセスする
    await loginPage.navigate();

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

    // 7. ユーザーメニューボタン（アバター）をクリックする
    await page.getByTestId('user-menu-button').click();

    // 8. 「ログアウト」メニューアイテムをクリックする
    await page.getByRole('menuitem', { name: 'ログアウト' }).click();

    // 9. ログインページ（/login）にリダイレクトされること
    await expect(page).toHaveURL('/login');

    // 10. マイファイル（ダッシュボード）ページ（/）に直接アクセスする
    await page.goto('/');

    // 11. 再度ログインページ（/login）にリダイレクトされること
    await expect(page).toHaveURL('/login');

    // 12. ログインページの見出し「ログイン」が表示されること
    await expect(
      page.getByRole('heading', { name: 'ログイン', level: 1 })
    ).toBeVisible();
  });
});
