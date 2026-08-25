import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { FileListPage } from '../../pages/FileListPage';
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

test.describe('文書一覧', () => {
  test.describe('文書一覧にアップロード済みの文書情報が表示されること', () => {
    let fileListPage: FileListPage;
    let testFilePaths: string[];

    test.beforeEach(async ({ page }) => {
      fileListPage = await loginAndOpenFileList(page);

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

    test('文書一覧にアップロード済みの文書情報が表示されること', async () => {
      // 1. 文書一覧ページ（`/`）にアクセスする（beforeEachで実行済み）

      // 2. 「マイファイル」の一覧に「田中商事_請求書.pdf」の行が表示されること
      expect(await fileListPage.isFileVisible('田中商事_請求書.pdf')).toBe(
        true
      );

      const targetRow = fileListPage
        .getFileRows()
        .filter({ hasText: '田中商事_請求書.pdf' });

      // 3. 同じ行に更新日時（Last Modified 列）が表示されること
      await expect(targetRow.locator('[data-field="uploadedAt"]')).toHaveText(
        /\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}/
      );

      // 4. 同じ行にファイルサイズ（File Size 列）が表示されること
      await expect(targetRow.locator('[data-field="size"]')).toHaveText(
        /\d+(\.\d+)?\s(Bytes|KB|MB|GB|TB)/
      );

      // 5. 「佐藤建設_契約書.pdf」についても同様に一覧へ表示されること
      expect(await fileListPage.isFileVisible('佐藤建設_契約書.pdf')).toBe(
        true
      );
    });
  });

  test.describe('ファイル名列ヘッダーをクリックすると昇順にソートされること', () => {
    let fileListPage: FileListPage;
    let testFilePaths: string[];

    test.beforeEach(async ({ page }) => {
      fileListPage = await loginAndOpenFileList(page);

      // Rows per page（5件）と件数を一致させ、1回のフェッチで全件を読み込ませる
      testFilePaths = createTestFiles([
        '田中商事_請求書.pdf',
        '佐藤建設_契約書.pdf',
        '資料001.pdf',
        '資料002.pdf',
        '資料003.pdf',
      ]);
      await fileListPage.uploadFiles(testFilePaths, testFilePaths.length);
    });

    test.afterEach(async ({ page }) => {
      cleanupTestFiles(testFilePaths);
      // MSWのモックファイルデータをリセットする
      await page.reload();
    });

    test('ファイル名列ヘッダーをクリックすると昇順にソートされること', async () => {
      // 1. 文書一覧ページ（`/`）にアクセスする（beforeEachで実行済み）

      // 2. 「Rows per page:」のセレクトボックスで「5」を選択する
      await fileListPage.setRowsPerPage(5);

      // 3. 「Name」列ヘッダーをクリックする
      await fileListPage.sortByName();

      // 4. 1ページ目（5件表示）の並び順が
      //    「佐藤建設_契約書.pdf」→「資料001.pdf」〜「資料003.pdf」→「田中商事_請求書.pdf」の順になること
      await expect
        .poll(() => fileListPage.getFileNames(), { timeout: 10000 })
        .toEqual([
          '佐藤建設_契約書.pdf',
          '資料001.pdf',
          '資料002.pdf',
          '資料003.pdf',
          '田中商事_請求書.pdf',
        ]);
    });
  });

  test.describe('ページネーションで次のページ・前のページに移動できること', () => {
    let fileListPage: FileListPage;
    let testFilePaths: string[];

    test.beforeEach(async ({ page }) => {
      fileListPage = await loginAndOpenFileList(page);

      // 「田中商事_請求書.pdf → 佐藤建設_契約書.pdf → 資料001.pdf 〜 資料005.pdf」の順にアップロード
      testFilePaths = createTestFiles([
        '田中商事_請求書.pdf',
        '佐藤建設_契約書.pdf',
        '資料001.pdf',
        '資料002.pdf',
        '資料003.pdf',
        '資料004.pdf',
        '資料005.pdf',
      ]);
      await fileListPage.uploadFiles(testFilePaths, 7);
    });

    test.afterEach(async ({ page }) => {
      cleanupTestFiles(testFilePaths);
      // MSWのモックファイルデータをリセットする
      await page.reload();
    });

    test('ページネーションで次のページ・前のページに移動できること', async () => {
      // 7件のアップロード（beforeEach）+ 複数回のページ操作を行うため、
      // 並列実行時の負荷でデフォルトタイムアウト（30秒）を超えることがある
      test.setTimeout(60000);

      // 1. 文書一覧ページ（`/`）にアクセスする（beforeEachで実行済み）

      // 2. 「Rows per page:」のセレクトボックスで「5」を選択する
      await fileListPage.setRowsPerPage(5);

      // 3. ページ下部に「1–5 of 7」と表示され、1ページ目に5件の文書が表示されていること
      await expect
        .poll(() => fileListPage.getPaginationRangeText(), { timeout: 10000 })
        .toBe('1–5 of 7');
      expect(await fileListPage.getFileRowCount()).toBe(5);

      // 4. 「Go to next page」ボタンをクリックする
      await fileListPage.goToNextPage();

      // 5. 2ページ目に残り2件の文書が表示され、「6–7 of 7」と表示されること
      await expect
        .poll(() => fileListPage.getPaginationRangeText(), { timeout: 10000 })
        .toBe('6–7 of 7');
      expect(await fileListPage.getFileRowCount()).toBe(2);

      // 6. 「Go to next page」ボタンが無効化されていること
      await expect
        .poll(() => fileListPage.isNextPageButtonEnabled(), {
          timeout: 10000,
        })
        .toBe(false);

      // 7. 「Go to previous page」ボタンをクリックすると
      //    1ページ目（5件表示、「1–5 of 7」）に戻ること
      await fileListPage.goToPreviousPage();
      await expect
        .poll(() => fileListPage.getPaginationRangeText(), { timeout: 10000 })
        .toBe('1–5 of 7');
      expect(await fileListPage.getFileRowCount()).toBe(5);
    });
  });

  test.describe('キーワード検索でファイル名が一致する文書のみ表示されること', () => {
    let fileListPage: FileListPage;
    let testFilePaths: string[];

    test.beforeEach(async ({ page }) => {
      fileListPage = await loginAndOpenFileList(page);

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

    test('キーワード検索でファイル名が一致する文書のみ表示されること', async () => {
      // 1. 文書一覧ページ（`/`）にアクセスする（beforeEachで実行済み）

      // 2. 検索ボックスに「田中商事」と入力する
      await fileListPage.fillSearch('田中商事');

      // 3. 300ms のデバウンス処理が完了するまで待機する（検索は入力から300ms後に実行される）
      await fileListPage.waitForSearchDebounce();

      // 4. 一覧に「田中商事_請求書.pdf」のみが表示されること
      await expect
        .poll(() => fileListPage.getFileRowCount(), { timeout: 10000 })
        .toBe(1);
      expect(await fileListPage.isFileVisible('田中商事_請求書.pdf')).toBe(
        true
      );

      // 5. 「佐藤建設_契約書.pdf」が一覧に表示されないこと
      expect(await fileListPage.isFileVisible('佐藤建設_契約書.pdf')).toBe(
        false
      );
    });
  });

  test.describe('検索バーをクリアするとすべての文書が再表示されること', () => {
    let fileListPage: FileListPage;
    let testFilePaths: string[];

    test.beforeEach(async ({ page }) => {
      fileListPage = await loginAndOpenFileList(page);

      testFilePaths = createTestFiles([
        '田中商事_請求書.pdf',
        '佐藤建設_契約書.pdf',
      ]);
      await fileListPage.uploadFiles(testFilePaths, testFilePaths.length);

      // 検索ボックスに「田中商事」と入力し、検索結果を絞り込んだ状態にしておく
      await fileListPage.search('田中商事');
      await expect
        .poll(() => fileListPage.getFileRowCount(), { timeout: 10000 })
        .toBe(1);
    });

    test.afterEach(async ({ page }) => {
      cleanupTestFiles(testFilePaths);
      // MSWのモックファイルデータをリセットする
      await page.reload();
    });

    test('検索バーをクリアするとすべての文書が再表示されること', async () => {
      // 1. 検索ボックス右側のクリアボタン（×）をクリックする
      await fileListPage.clearSearch();

      // 2. 検索ボックスが空になること
      await expect(fileListPage.page.getByTestId('searchField')).toHaveValue(
        ''
      );

      // 3. 一覧に「田中商事_請求書.pdf」と「佐藤建設_契約書.pdf」の両方が再表示されること
      await expect
        .poll(() => fileListPage.getFileRowCount(), { timeout: 10000 })
        .toBe(2);
      expect(await fileListPage.isFileVisible('田中商事_請求書.pdf')).toBe(
        true
      );
      expect(await fileListPage.isFileVisible('佐藤建設_契約書.pdf')).toBe(
        true
      );
    });
  });

  test.describe('該当する文書が見つからない場合にメッセージが表示されること', () => {
    let fileListPage: FileListPage;
    let testFilePaths: string[];

    test.beforeEach(async ({ page }) => {
      fileListPage = await loginAndOpenFileList(page);

      testFilePaths = createTestFiles(['田中商事_請求書.pdf']);
      await fileListPage.uploadFiles(testFilePaths, testFilePaths.length);
    });

    test.afterEach(async ({ page }) => {
      cleanupTestFiles(testFilePaths);
      // MSWのモックファイルデータをリセットする
      await page.reload();
    });

    test('該当する文書が見つからない場合にメッセージが表示されること', async () => {
      // 1. 文書一覧ページ（`/`）にアクセスする（beforeEachで実行済み）

      // 2. 検索ボックスに「存在しないキーワードXYZ」と入力する
      await fileListPage.fillSearch('存在しないキーワードXYZ');

      // 3. 300ms のデバウンス処理が完了するまで待機する
      await fileListPage.waitForSearchDebounce();

      // 4. data-testid="emptySearchResult" の要素が表示されること
      //    （メッセージ文言はi18nで変わるため、testidの表示有無で判定する）
      await expect
        .poll(() => fileListPage.isEmptySearchResultVisible(), {
          timeout: 10000,
        })
        .toBe(true);
    });
  });
});
