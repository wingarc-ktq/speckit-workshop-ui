import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { FileListPage } from '../../pages/FileListPage';
import { CommandPalettePage } from '../../pages/CommandPalettePage';
import { testUsers } from '../../fixtures/testUsers';
import { createTestFiles, cleanupTestFiles } from '../../fixtures/testFiles';

/**
 * ログインしてマイファイル画面（文書一覧）に遷移する
 */
async function loginAndOpenFileList(
  page: import('@playwright/test').Page
): Promise<FileListPage> {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.login(
    testUsers.validUser.email,
    testUsers.validUser.password
  );
  await expect(page).toHaveURL('/');
  return new FileListPage(page);
}

test.describe('コマンドパレット', () => {
  test.describe('Ctrl+K でコマンドパレットが開くこと', () => {
    let fileListPage: FileListPage;
    let commandPalettePage: CommandPalettePage;
    let testFilePaths: string[];

    test.beforeEach(async ({ page }) => {
      fileListPage = await loginAndOpenFileList(page);
      commandPalettePage = new CommandPalettePage(page);

      testFilePaths = createTestFiles([
        '田中商事_請求書.pdf',
        '佐藤建設_契約書.pdf',
      ]);
      await fileListPage.uploadFiles(testFilePaths, testFilePaths.length);
    });

    test.afterEach(async ({ page }) => {
      cleanupTestFiles(testFilePaths);
      // MSWのモックファイルデータをリセットする
      await page.reload();
    });

    test('Ctrl+K でコマンドパレットが開くこと', async () => {
      // 1. 文書一覧ページ（`/`）にアクセスする（beforeEachで実行済み）

      // 2. Control+K を押す
      await commandPalettePage.open();

      // 3. commandPalette のダイアログが表示されること
      await expect.poll(() => commandPalettePage.isOpen()).toBe(true);

      // 4. commandPaletteInput の入力欄にフォーカスが当たっていること
      expect(await commandPalettePage.isInputFocused()).toBe(true);

      // 5. commandPaletteItem の候補が2件表示されること
      await expect.poll(() => commandPalettePage.getItemCount()).toBe(2);
    });
  });

  test.describe('キーワードを入力すると候補が絞り込まれること', () => {
    let fileListPage: FileListPage;
    let commandPalettePage: CommandPalettePage;
    let testFilePaths: string[];

    test.beforeEach(async ({ page }) => {
      fileListPage = await loginAndOpenFileList(page);
      commandPalettePage = new CommandPalettePage(page);

      testFilePaths = createTestFiles([
        '田中商事_請求書.pdf',
        '佐藤建設_契約書.pdf',
      ]);
      await fileListPage.uploadFiles(testFilePaths, testFilePaths.length);

      // Control+K でコマンドパレットが開いている状態にしておく
      await commandPalettePage.open();
      await expect.poll(() => commandPalettePage.getItemCount()).toBe(2);
    });

    test.afterEach(async ({ page }) => {
      cleanupTestFiles(testFilePaths);
      // MSWのモックファイルデータをリセットする
      await page.reload();
    });

    test('キーワードを入力すると候補が絞り込まれること', async () => {
      // 1. commandPaletteInput に「田中商事」と入力する
      await commandPalettePage.fillSearch('田中商事');

      // 2. 300ms のデバウンス処理が完了するまで待機する
      await commandPalettePage.waitForSearchDebounce();

      // 3. commandPaletteItem の候補が1件のみ表示され、「田中商事_請求書.pdf」であること
      await expect
        .poll(() => commandPalettePage.getItemCount(), { timeout: 10000 })
        .toBe(1);
      expect(
        await commandPalettePage.isItemVisible('田中商事_請求書.pdf')
      ).toBe(true);

      // 4. 「佐藤建設_契約書.pdf」は候補に表示されないこと
      expect(
        await commandPalettePage.isItemVisible('佐藤建設_契約書.pdf')
      ).toBe(false);
    });
  });

  test.describe('Esc でコマンドパレットが閉じること', () => {
    let fileListPage: FileListPage;
    let commandPalettePage: CommandPalettePage;
    let testFilePaths: string[];

    test.beforeEach(async ({ page }) => {
      fileListPage = await loginAndOpenFileList(page);
      commandPalettePage = new CommandPalettePage(page);

      testFilePaths = createTestFiles(['田中商事_請求書.pdf']);
      await fileListPage.uploadFiles(testFilePaths, testFilePaths.length);

      // Control+K でコマンドパレットが開いている状態にしておく
      await commandPalettePage.open();
      await expect.poll(() => commandPalettePage.isOpen()).toBe(true);
    });

    test.afterEach(async ({ page }) => {
      cleanupTestFiles(testFilePaths);
      // MSWのモックファイルデータをリセットする
      await page.reload();
    });

    test('Esc でコマンドパレットが閉じること', async () => {
      // 1. Escape キーを押す
      await commandPalettePage.close();

      // 2. commandPalette のダイアログが表示されなくなること
      await expect.poll(() => commandPalettePage.isOpen()).toBe(false);
    });
  });
});
