import { Page } from '@playwright/test';

/**
 * アップロードダイアログのPage Object
 * 
 * ファイル選択・ドラッグ&ドロップ・タグ選択・アップロード実行機能をサポート
 */
export class UploadDialogPage {
  constructor(private page: Page) {}

  // ==================== ダイアログ表示確認 ====================

  /**
   * アップロードダイアログが表示されているか確認
   */
  async isDialogVisible(): Promise<boolean> {
    return this.page.getByRole('dialog').isVisible();
  }

  /**
   * ダイアログタイトルが表示されているか確認
   */
  async getDialogTitle(): Promise<string | null> {
    return await this.page
      .getByRole('dialog')
      .getByText('文書をアップロード')
      .textContent();
  }

  /**
   * ファイルドロップエリアが表示されているか確認
   */
  async isDropAreaVisible(): Promise<boolean> {
    return this.page
      .getByText(/ファイルをドラッグ&ドロップ/)
      .isVisible();
  }

  /**
   * 「ファイルを選択」ボタンが表示されているか確認
   */
  async isFileSelectButtonVisible(): Promise<boolean> {
    return this.page
      .getByRole('button', { name: /ファイルを選択/ })
      .isVisible();
  }

  /**
   * 対応形式の説明が表示されているか確認
   */
  async isFormatDescriptionVisible(): Promise<boolean> {
    return this.page
      .getByText(/対応形式: PDF, Word, Excel, 画像/)
      .isVisible();
  }

  /**
   * タグ選択セクションが表示されているか確認
   */
  async isTagSectionVisible(): Promise<boolean> {
    return this.page.getByText('タグを選択').isVisible();
  }

  // ==================== ファイル選択操作 ====================

  /**
   * ファイル選択ボタンをクリックしてファイルを選択
   * @param filePaths アップロードするファイルのパス（複数可）
   */
  async selectFiles(filePaths: string | string[]): Promise<void> {
    const paths = Array.isArray(filePaths) ? filePaths : [filePaths];
    
    // ファイル入力要素を取得
    const fileInput = this.page.locator('input[type="file"]');
    
    // ファイルを選択
    await fileInput.setInputFiles(paths);
  }

  /**
   * ドラッグ&ドロップでファイルを追加
   * @param filePaths ドロップするファイルのパス（複数可）
   */
  async dragDropFiles(filePaths: string | string[]): Promise<void> {
    const paths = Array.isArray(filePaths) ? filePaths : [filePaths];
    
    // ドロップエリアを取得
    const dropArea = this.page.locator('text=/ファイルをドラッグ&ドロップ/').locator('..');
    
    // ファイルをドロップ
    await dropArea.setInputFiles(paths);
  }

  /**
   * 選択されたファイル数を取得
   */
  async getSelectedFileCount(): Promise<number> {
    const fileCountText = await this.page
      .getByText(/\d+個のファイルを選択/)
      .textContent();
    
    if (!fileCountText) return 0;
    
    const match = fileCountText.match(/(\d+)個/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * 選択されたファイル一覧が表示されているか確認
   */
  async areSelectedFilesVisible(): Promise<boolean> {
    return this.page
      .getByText(/選択されたファイル/)
      .isVisible();
  }

  /**
   * 指定したファイル名が選択ファイル一覧に表示されているか確認
   */
  async isFileInList(fileName: string): Promise<boolean> {
    return this.page
      .locator(`text="${fileName}"`)
      .isVisible();
  }

  /**
   * 選択したファイルを削除
   * @param index 削除するファイルのインデックス
   */
  async removeFile(index: number): Promise<void> {
    const removeButtons = this.page.locator('button[aria-label*="削除"]');
    await removeButtons.nth(index).click();
  }

  // ==================== タグ選択操作 ====================

  /**
   * タグを選択
   * @param tagName タグ名（完了、契約書、請求書、未処理、処理中、議事録）
   */
  async selectTag(tagName: string): Promise<void> {
    const tagChip = this.page
      .getByRole('dialog')
      .locator(`text="${tagName}"`)
      .locator('..');
    await tagChip.click();
  }

  /**
   * 複数のタグを選択
   * @param tagNames タグ名の配列
   */
  async selectMultipleTags(tagNames: string[]): Promise<void> {
    for (const tagName of tagNames) {
      await this.selectTag(tagName);
    }
  }

  /**
   * 指定したタグが選択されているか確認
   */
  async isTagSelected(tagName: string): Promise<boolean> {
    const tagChip = this.page
      .locator(`text="${tagName}"`)
      .locator('..')
      .locator('button');
    const classes = await tagChip.getAttribute('class');
    return classes
      ? classes.includes('active') || classes.includes('selected')
      : false;
  }

  // ==================== エラーメッセージ確認 ====================

  /**
   * エラーメッセージが表示されているか確認
   */
  async isErrorMessageVisible(): Promise<boolean> {
    return this.page.locator('[role="alert"]').isVisible();
  }

  /**
   * エラーメッセージのテキストを取得
   */
  async getErrorMessage(): Promise<string | null> {
    return await this.page.locator('[role="alert"]').textContent();
  }

  /**
   * 特定のエラーメッセージが表示されているか確認
   */
  async hasErrorMessage(message: string): Promise<boolean> {
    return this.page
      .locator('[role="alert"]')
      .getByText(message)
      .isVisible();
  }

  // ==================== ボタン操作 ====================

  /**
   * 「アップロード」ボタンをクリック
   */
  async clickUploadButton(): Promise<void> {
    const uploadButton = this.page
      .getByRole('dialog')
      .getByRole('button', { name: /アップロード/ });
    await uploadButton.click();
    
    // アップロード処理の完了を待機
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * 「キャンセル」ボタンをクリック
   */
  async clickCancelButton(): Promise<void> {
    const cancelButton = this.page
      .getByRole('dialog')
      .getByRole('button', { name: /キャンセル/ });
    await cancelButton.click();
  }

  /**
   * 「アップロード」ボタンが有効か確認
   */
  async isUploadButtonEnabled(): Promise<boolean> {
    const uploadButton = this.page
      .getByRole('dialog')
      .getByRole('button', { name: /アップロード/ });
    const isDisabled = await uploadButton.isDisabled();
    return !isDisabled;
  }

  /**
   * 「アップロード」ボタンが無効か確認
   */
  async isUploadButtonDisabled(): Promise<boolean> {
    const uploadButton = this.page
      .getByRole('dialog')
      .getByRole('button', { name: /アップロード/ });
    return await uploadButton.isDisabled();
  }

  // ==================== ダイアログ状態確認 ====================

  /**
   * ダイアログが閉じられたか確認
   */
  async isDialogClosed(): Promise<boolean> {
    try {
      const isVisible = await this.page
        .getByRole('dialog')
        .isVisible({ timeout: 1000 });
      return !isVisible;
    } catch {
      return true;
    }
  }

  /**
   * ダイアログが閉じられるまで待機
   */
  async waitForDialogClose(): Promise<void> {
    await this.page.waitForSelector('[role="dialog"]', {
      state: 'hidden',
      timeout: 5000,
    });
  }
}
