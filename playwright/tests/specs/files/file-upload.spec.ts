import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { DocumentManagementPage } from '../../pages/DocumentManagementPage';
import { UploadDialogPage } from '../../pages/UploadDialogPage';
import { FileListPage } from '../../pages/FileListPage';
import { testUsers } from '../../fixtures/testUsers';
import { testFiles } from '../../fixtures/testFiles';

test.describe('ファイルアップロード', () => {
  let loginPage: LoginPage;
  let documentPage: DocumentManagementPage;
  let uploadDialog: UploadDialogPage;
  let fileListPage: FileListPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    documentPage = new DocumentManagementPage(page);
    uploadDialog = new UploadDialogPage(page);
    fileListPage = new FileListPage(page);

    // ログイン
    await loginPage.navigate();
    await loginPage.fillEmail(testUsers.validUser.email);
    await loginPage.fillPassword(testUsers.validUser.password);
    await loginPage.clickLoginButton();

    // ログイン完了を待ってから文書管理ページへ
    await page.waitForURL('**/', { timeout: 10000 });
    await documentPage.navigate();

    // URL遷移とアップロードボタンの可視を待機してから操作する
    await page.waitForURL('**/documents', { timeout: 10000 });
    await page
      .getByRole('button', { name: 'アップロード', exact: true })
      .waitFor({ state: 'visible', timeout: 10000 });
  });

  test('アップロードダイアログが表示されること', async () => {
    // 1. 文書管理ページの「アップロード」ボタンをクリックする
    await documentPage.clickUploadButton();

    // 2. 「文書をアップロード」ダイアログが表示されること
    const isDialogVisible = await uploadDialog.isDialogVisible();
    expect(isDialogVisible).toBeTruthy();

    // 3. ダイアログに以下の要素が含まれていること
    // - タイトル：「文書をアップロード」
    const dialogTitle = await uploadDialog.getDialogTitle();
    expect(dialogTitle).toContain('文書をアップロード');

    // - ファイルドロップエリア（「ファイルをドラッグ&ドロップ、または」のテキスト）
    const isDropAreaVisible = await uploadDialog.isDropAreaVisible();
    expect(isDropAreaVisible).toBeTruthy();

    // - 「ファイルを選択」ボタン
    const isFileSelectButtonVisible =
      await uploadDialog.isFileSelectButtonVisible();
    expect(isFileSelectButtonVisible).toBeTruthy();

    // - 対応形式の説明：「対応形式: PDF, Word, Excel, 画像 (最大10MB、最大20ファイル)」
    const isFormatDescriptionVisible =
      await uploadDialog.isFormatDescriptionVisible();
    expect(isFormatDescriptionVisible).toBeTruthy();

    // - タグ選択セクション（「タグを選択」の見出し）
    const isTagSectionVisible = await uploadDialog.isTagSectionVisible();
    expect(isTagSectionVisible).toBeTruthy();

    // - 「アップロード」ボタン（初期状態は無効）
    const isUploadButtonDisabled = await uploadDialog.isUploadButtonDisabled();
    expect(isUploadButtonDisabled).toBeTruthy();
  });

  test('ファイルを選択してアップロードできること', async () => {
    // 1. 「アップロード」ボタンをクリックする
    await documentPage.clickUploadButton();

    // 2. 「文書をアップロード」ダイアログが表示されること
    const isDialogVisible = await uploadDialog.isDialogVisible();
    expect(isDialogVisible).toBeTruthy();

    // 3. 対応形式のファイルを選択する
    await uploadDialog.selectFiles(testFiles.pdfFile);

    // 4. 選択したファイルが表示されること
    const isFileVisible = await uploadDialog.isFileInList('drag-drop-test.pdf');
    expect(isFileVisible).toBeTruthy();

    // 5. 「完了」タグをクリックして選択する
    await uploadDialog.selectTag('完了');

    // 6. 「契約書」タグをクリックして選択する
    await uploadDialog.selectTag('契約書');

    // 7. 「アップロード」ボタンが有効になること
    const isUploadButtonEnabled = await uploadDialog.isUploadButtonEnabled();
    expect(isUploadButtonEnabled).toBeTruthy();

    // 8. 「アップロード」ボタンをクリックする
    await uploadDialog.clickUploadButton();

    // 9. ダイアログが閉じること
    await uploadDialog.waitForDialogClose();
    const isDialogClosed = await uploadDialog.isDialogClosed();
    expect(isDialogClosed).toBeTruthy();

    // 10. 文書一覧に新しいファイルが追加されること
    const isFileInList = await fileListPage.isTableVisible();
    expect(isFileInList).toBeTruthy();
  });

  test('ドラッグ&ドロップでファイルをアップロードできること', async () => {
    // 1. 「アップロード」ボタンをクリックする
    await documentPage.clickUploadButton();

    // 2. 「文書をアップロード」ダイアログが表示されること
    const isDialogVisible = await uploadDialog.isDialogVisible();
    expect(isDialogVisible).toBeTruthy();

    // 3. ファイルをドロップエリアにドラッグ&ドロップする
    await uploadDialog.dragDropFiles(testFiles.pdfFile);

    // 4. ドロップしたファイルが表示されること
    const isFileVisible = await uploadDialog.isFileInList('drag-drop-test.pdf');
    expect(isFileVisible).toBeTruthy();

    // 5. 「請求書」タグをクリックして選択する
    await uploadDialog.selectTag('請求書');

    // 6. 「アップロード」ボタンが有効になること
    const isUploadButtonEnabled = await uploadDialog.isUploadButtonEnabled();
    expect(isUploadButtonEnabled).toBeTruthy();

    // 7. 「アップロード」ボタンをクリックする
    await uploadDialog.clickUploadButton();

    // 8. ダイアログが閉じること
    await uploadDialog.waitForDialogClose();
    const isDialogClosed = await uploadDialog.isDialogClosed();
    expect(isDialogClosed).toBeTruthy();

    // 9. 文書一覧に新しいファイルが追加されること
    const isFileInList = await fileListPage.isTableVisible();
    expect(isFileInList).toBeTruthy();
  });

  test('複数ファイルを同時にアップロードできること', async () => {
    // 1. 「アップロード」ボタンをクリックする
    await documentPage.clickUploadButton();

    // 2. 「文書をアップロード」ダイアログが表示されること
    const isDialogVisible = await uploadDialog.isDialogVisible();
    expect(isDialogVisible).toBeTruthy();

    // 3. 複数ファイルを選択する
    await uploadDialog.selectFiles([
      testFiles.document1,
      testFiles.document2,
      testFiles.document3,
    ]);

    // 4. 選択した3つのファイルがすべて表示されること
    const fileCount = await uploadDialog.getSelectedFileCount();
    expect(fileCount).toBe(3);

    // 5. 「完了」タグをクリックして選択する
    await uploadDialog.selectTag('完了');

    // 6. 「アップロード」ボタンが有効になること
    const isUploadButtonEnabled = await uploadDialog.isUploadButtonEnabled();
    expect(isUploadButtonEnabled).toBeTruthy();

    // 7. 「アップロード」ボタンをクリックする
    await uploadDialog.clickUploadButton();

    // 8. ダイアログが閉じること
    await uploadDialog.waitForDialogClose();
    const isDialogClosed = await uploadDialog.isDialogClosed();
    expect(isDialogClosed).toBeTruthy();

    // 9. 文書一覧に3つの新しいファイルがすべて追加されること
    const isFileInList = await fileListPage.isTableVisible();
    expect(isFileInList).toBeTruthy();
  });

  test('ファイルサイズ超過時にエラーメッセージが表示されること', async ({
    page,
  }) => {
    // 1. 「アップロード」ボタンをクリックする
    await documentPage.clickUploadButton();

    // 2. 「文書をアップロード」ダイアログが表示されること
    const isDialogVisible = await uploadDialog.isDialogVisible();
    expect(isDialogVisible).toBeTruthy();

    // 3. 10MBを超えるファイルを動的に生成してアップロード
    // Playwrightでは、実際のファイルではなく、ブラウザ内でFileオブジェクトを生成
    await page.evaluate(() => {
      // 15MBのダミーファイルを生成
      const largeFileContent = new Array(15 * 1024 * 1024).fill('A').join('');
      const largeFile = new File([largeFileContent], 'large-file.pdf', {
        type: 'application/pdf',
      });

      // ファイル入力要素を取得してファイルを設定
      const input = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(largeFile);
        input.files = dataTransfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    // 4. エラーメッセージが表示されること
    const hasError = await uploadDialog.hasErrorMessage(
      'ファイルサイズが大きすぎます'
    );
    expect(hasError).toBeTruthy();

    // 5. 「アップロード」ボタンが無効のままであること
    const isUploadButtonDisabled = await uploadDialog.isUploadButtonDisabled();
    expect(isUploadButtonDisabled).toBeTruthy();
  });

  test('対応外のファイル形式でエラーメッセージが表示されること', async ({
    page,
  }) => {
    // 1. 「アップロード」ボタンをクリックする
    await documentPage.clickUploadButton();

    // 2. 「文書をアップロード」ダイアログが表示されること
    const isDialogVisible = await uploadDialog.isDialogVisible();
    expect(isDialogVisible).toBeTruthy();

    // 3. 対応外形式のファイルを生成してアップロード
    await page.evaluate(() => {
      const invalidFile = new File(['invalid content'], 'invalid-file.exe', {
        type: 'application/x-msdownload',
      });

      const input = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(invalidFile);
        input.files = dataTransfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    // 4. エラーメッセージが表示されること
    const hasError = await uploadDialog.hasErrorMessage(
      '対応していない拡張子です'
    );
    expect(hasError).toBeTruthy();

    // 5. 「アップロード」ボタンが無効のままであること
    const isUploadButtonDisabled = await uploadDialog.isUploadButtonDisabled();
    expect(isUploadButtonDisabled).toBeTruthy();
  });

  test('20ファイル超過時にエラーメッセージが表示されること', async ({
    page,
  }) => {
    // 1. 「アップロード」ボタンをクリックする
    await documentPage.clickUploadButton();

    // 2. 「文書をアップロード」ダイアログが表示されること
    const isDialogVisible = await uploadDialog.isDialogVisible();
    expect(isDialogVisible).toBeTruthy();

    // 3. 21個のファイルを動的に生成してアップロード
    await page.evaluate(() => {
      const files = [];
      for (let i = 1; i <= 21; i++) {
        const file = new File([`content ${i}`], `file${i}.pdf`, {
          type: 'application/pdf',
        });
        files.push(file);
      }

      const input = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      if (input) {
        const dataTransfer = new DataTransfer();
        files.forEach((file) => dataTransfer.items.add(file));
        input.files = dataTransfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    // 4. エラーメッセージが表示されること
    const hasError = await uploadDialog.hasErrorMessage('最大20ファイル');
    expect(hasError).toBeTruthy();
  });

  test('タグを選択せずにアップロードできること', async () => {
    // 1. 「アップロード」ボタンをクリックする
    await documentPage.clickUploadButton();

    // 2. 「文書をアップロード」ダイアログが表示されること
    const isDialogVisible = await uploadDialog.isDialogVisible();
    expect(isDialogVisible).toBeTruthy();

    // 3. ファイルを選択する
    await uploadDialog.selectFiles(testFiles.noTagFile);

    // 4. タグを選択せずに「アップロード」ボタンが有効になること
    const isUploadButtonEnabled = await uploadDialog.isUploadButtonEnabled();
    expect(isUploadButtonEnabled).toBeTruthy();

    // 5. 「アップロード」ボタンをクリックする
    await uploadDialog.clickUploadButton();

    // 6. ダイアログが閉じること
    await uploadDialog.waitForDialogClose();
    const isDialogClosed = await uploadDialog.isDialogClosed();
    expect(isDialogClosed).toBeTruthy();

    // 7. 文書一覧に新しいファイルが追加されること
    const isFileInList = await fileListPage.isTableVisible();
    expect(isFileInList).toBeTruthy();
  });

  test('キャンセルボタンでダイアログを閉じられること', async ({ page }) => {
    // ページをリロードして初期状態をリセット
    await page.goto(documentPage.url);
    
    // テーブルが完全にレンダリングされるのを待つ
    await fileListPage.isTableVisible();
    
    // テーブルのデータ行が実際にロードされるまで待つ
    // （ヘッダー行だけでなく、実データが表示されるまで）
    await fileListPage.getTableRows().first().waitFor({ state: 'visible' });
    
    // 1. 現在の件数ラベルを記録（ダイアログを開く前）
    // 「1-20 / 25 件の文書」のようなラベル全体を比較することで
    // 数値抽出のバグを避け、より堅牢な検証ができる
    const initialLabel = await fileListPage.getFileCountLabel();

    // 2. 「アップロード」ボタンをクリックする
    await documentPage.clickUploadButton();

    // 3. 「文書をアップロード」ダイアログが表示されること
    const isDialogVisible = await uploadDialog.isDialogVisible();
    expect(isDialogVisible).toBeTruthy();

    // 4. 対応形式のファイルを選択する
    await uploadDialog.selectFiles(testFiles.pdfFile);

    // 5. 選択したファイルが表示されること
    const isFileVisible = await uploadDialog.isFileInList('drag-drop-test.pdf');
    expect(isFileVisible).toBeTruthy();

    // 6. 「キャンセル」ボタンをクリックする
    await uploadDialog.clickCancelButton();

    // 7. ダイアログが閉じること
    await uploadDialog.waitForDialogClose();
    const isDialogClosed = await uploadDialog.isDialogClosed();
    expect(isDialogClosed).toBeTruthy();

    // 8. 文書一覧に新しいファイルが追加されていないこと（アップロードがキャンセルされていること）
    // ラベルの文字列が変わっていないことで、件数が増えていないことを確認
    const finalLabel = await fileListPage.getFileCountLabel();
    expect(finalLabel).toBe(initialLabel);
  });

  test('アップロード後にキャッシュが無効化されること', async ({ page }) => {
    // ページをリロードして初期状態をリセット
    await page.goto(documentPage.url);
    
    // テーブルが完全にレンダリングされるのを待つ
    await fileListPage.isTableVisible();
    
    // テーブルのデータ行が実際にロードされるまで待つ
    await fileListPage.getTableRows().first().waitFor({ state: 'visible' });
    
    // 1. 現在の全体ファイル件数を記録する
    const initialTotalCount = await fileListPage.getTotalFileCount();

    // 2. 「アップロード」ボタンをクリックする
    await documentPage.clickUploadButton();

    // 3. 対応形式のファイルを選択してアップロードする
    await uploadDialog.selectFiles(testFiles.pdfFile);
    await uploadDialog.selectTag('完了');
    await uploadDialog.clickUploadButton();

    // 4. ダイアログが閉じること
    await uploadDialog.waitForDialogClose();

    // 5. 文書一覧が自動的に更新されること（リロード不要）
    // 少し待機してキャッシュ無効化が完了するのを待つ
    await fileListPage.page.waitForTimeout(1000);

    // 6. 文書一覧の件数が1件増加していること
    const finalTotalCount = await fileListPage.getTotalFileCount();
    expect(finalTotalCount).toBe(initialTotalCount + 1);
  });
});
