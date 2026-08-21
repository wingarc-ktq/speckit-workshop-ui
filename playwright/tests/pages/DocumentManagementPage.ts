import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * 文書管理ページのPage Object
 */
export class DocumentManagementPage extends BasePage {
  readonly url = '/documents';

  constructor(page: Page) {
    super(page);
  }

  /**
   * ページが表示されているか確認
   */
  async isDocumentManagementPage() {
    return this.page.getByRole('heading', { level: 1 }).isVisible();
  }

  /**
   * ファイル一覧テーブルが表示されているか確認
   */
  async isFileTableVisible() {
    return this.page.getByRole('table').isVisible();
  }

  /**
   * テーブルのすべてのファイル行を取得
   */
  getFileListRows() {
    return this.page.locator('table tbody tr');
  }

  /**
   * テーブルのファイル行数を取得
   */
  async getFileListRowCount() {
    return await this.getFileListRows().count();
  }

  /**
   * 空状態のメッセージが表示されているか確認
   */
  async isEmptyMessageVisible() {
    return this.page.getByText('ファイルがありません').isVisible();
  }

  /**
   * エラーメッセージが表示されているか確認
   */
  async isErrorMessageVisible() {
    return this.page.getByText('エラーが発生しました').isVisible();
  }

  /**
   * グリッドビューに切り替える
   */
  async switchToGridView() {
    const gridViewButton = this.page.locator('[title="グリッド"]');
    await gridViewButton.click();
  }

  /**
   * リストビューに切り替える
   */
  async switchToListView() {
    const listViewButton = this.page.locator('[title="リスト"]');
    await listViewButton.click();
  }

  /**
   * グリッドビューが表示されているか確認
   */
  async isGridViewVisible() {
    return this.page.locator('[role="grid"]').isVisible();
  }

  /**
   * ソートボタンをクリック
   */
  async clickSortButton() {
    const sortButton = this.page.locator('button:has-text("ファイル名")');
    await sortButton.click();
  }

  /**
   * 昇順/降順ボタンをクリック
   */
  async toggleSortOrder() {
    const orderButton = this.page.locator('[title="昇順/降順"]');
    await orderButton.click();
  }

  /**
   * 検索キーワードで検索
   */
  async search(keyword: string) {
    const searchInput = this.page.locator('input[placeholder*="検索"]');
    await searchInput.fill(keyword);
    // デバウンス時間待機
    await this.page.waitForTimeout(400);
  }

  /**
   * 検索結果をクリア
   */
  async clearSearch() {
    const searchInput = this.page.locator('input[placeholder*="検索"]');
    await searchInput.clear();
    await this.page.waitForTimeout(400);
  }

  /**
   * 次ページボタンをクリック
   */
  async clickNextPage() {
    const nextButton = this.page.locator('button:has-text("Next")');
    await nextButton.click();
  }

  /**
   * 前ページボタンをクリック
   */
  async clickPreviousPage() {
    const prevButton = this.page.locator('button:has-text("Previous")');
    await prevButton.click();
  }

  /**
   * ハイライトされたテキストを確認
   */
  async hasHighlightedText(text: string) {
    const highlighted = this.page.locator(`text=${text}`).locator('..').locator('span:has-text("' + text + '")');
    return highlighted.isVisible();
  }

  /**
   * ファイル行から名前を取得
   */
  async getFileNameFromRow(rowIndex: number) {
    const row = this.getFileListRows().nth(rowIndex);
    const nameCell = row.locator('td').nth(1);
    return nameCell.textContent();
  }

  /**
   * 「アップロード」ボタンをクリック
   */
  async clickUploadButton() {
    const uploadButton = this.page.getByRole('button', {
      name: 'アップロード',
      exact: true,
    });
    await uploadButton.click();
  }
}
