import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * 文書管理ページ - 文書一覧表示のPage Object
 * 
 * リストビュー・グリッドビューの両方に対応
 * ソート・ページネーション・検索機能をサポート
 */
export class FileListPage extends BasePage {
  readonly url = '/documents';

  constructor(page: Page) {
    super(page);
  }

  // ==================== ページ判定 ====================

  /**
   * 文書管理ページが表示されているか確認
   */
  async isFileListPage(): Promise<boolean> {
    return this.page
      .getByRole('heading', { name: /文書管理/ })
      .isVisible()
      .catch(() => false);
  }

  // ==================== リストビュー操作 ====================

  /**
   * テーブルが表示されているか確認
   */
  async isTableVisible(): Promise<boolean> {
    return this.page.getByRole('table').isVisible();
  }

  /**
   * テーブルのすべてのファイル行を取得
   */
  getTableRows() {
    return this.page.locator('table tbody tr');
  }

  /**
   * テーブルのファイル行数を取得
   */
  async getTableRowCount(): Promise<number> {
    return await this.getTableRows().count();
  }

  /**
   * 全体のファイル件数を取得（「1-20 / 25 件の文書」から25を抽出）
   */
  async getTotalFileCount(): Promise<number> {
    const text = await this.page
      .getByText(/件の文書/)
      .textContent();
    
    if (!text) return 0;
    
    // "1-20 / 25 件の文書" から 25 を抽出
    const match = text.match(/\/\s*(\d+)\s*件/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * 件数ラベル全体を取得（「1-20 / 25 件の文書」のような形式）
   * テスト用：初期状態と比較して変化がないことを確認する際に使用
   */
  async getFileCountLabel(): Promise<string | null> {
    return await this.page
      .getByText(/件の文書/)
      .textContent();
  }

  /**
   * テーブルの指定行からファイル名を取得
   */
  async getFileNameFromTableRow(rowIndex: number): Promise<string | null> {
    const row = this.getTableRows().nth(rowIndex);
    return await row.locator('td').nth(1).textContent();
  }

  /**
   * テーブルの指定行からタグを取得
   */
  async getTagsFromTableRow(rowIndex: number): Promise<string[]> {
    const row = this.getTableRows().nth(rowIndex);
    const tagContainer = row.locator('td').nth(2);
    // タグチップの generic 要素のテキストを取得
    const tagChips = tagContainer.locator('> div > div');
    const count = await tagChips.count();
    const tags: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await tagChips.nth(i).textContent();
      if (text) tags.push(text.trim());
    }
    return tags;
  }

  /**
   * テーブルの指定行から更新日時を取得
   */
  async getDateFromTableRow(rowIndex: number): Promise<string | null> {
    const row = this.getTableRows().nth(rowIndex);
    return await row.locator('td').nth(3).textContent();
  }

  /**
   * テーブルの指定行からサイズを取得
   */
  async getSizeFromTableRow(rowIndex: number): Promise<string | null> {
    const row = this.getTableRows().nth(rowIndex);
    return await row.locator('td').nth(4).textContent();
  }

  // ==================== グリッドビュー操作 ====================

  /**
   * グリッドビューが表示されているか確認
   */
  async isGridViewVisible(): Promise<boolean> {
    const gridContainer = this.page.locator('[role="grid"]');
    return gridContainer.isVisible().catch(() => false);
  }

  /**
   * グリッドビューのすべてのカード要素を取得
   */
  getGridCards() {
    return this.page.locator('[role="grid"] > div > div');
  }

  /**
   * グリッドビューのカード数を取得
   */
  async getGridCardCount(): Promise<number> {
    return await this.getGridCards().count();
  }

  // ==================== ビューモード切替 ====================

  /**
   * リストビュー切替ボタンをクリック
   */
  async switchToListView(): Promise<void> {
    // MUIアイコンの data-testid を使って親ボタンを特定
    const listViewButton = this.page.locator('button:has(svg[data-testid="ViewListIcon"])');
    await listViewButton.click();
  }

  /**
   * グリッドビュー切替ボタンをクリック
   */
  async switchToGridView(): Promise<void> {
    // MUIアイコンの data-testid を使って親ボタンを特定
    const gridViewButton = this.page.locator('button:has(svg[data-testid="ViewModuleIcon"])');
    await gridViewButton.click();
    // グリッド表示が出るまで待機
    await this.page.locator('[role="grid"]').waitFor({ state: 'visible', timeout: 5000 });
  }

  // ==================== ソート操作 ====================

  /**
   * ソート項目を取得（現在のソート項目を確認）
   */
  async getSortFieldName(): Promise<string | null> {
    const sortButton = this.page
      .locator('text="並び替え:"')
      .locator('..')
      .locator('button')
      .first();
    return await sortButton.textContent();
  }

  /**
   * 昇順/降順ボタンを取得（現在の順序を確認）
   */
  async getSortOrder(): Promise<string | null> {
    const orderButton = this.page.getByRole('button', { name: /昇順|降順/ });
    return await orderButton.textContent();
  }

  /**
   * 昇順/降順を切り替える
   */
  async toggleSortOrder(): Promise<void> {
    const orderButton = this.page.getByRole('button', { name: /昇順|降順/ });
    await orderButton.click();
    // ソート実行待機
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * ソート項目ドロップダウンを開く
   */
  async openSortDropdown(): Promise<void> {
    const sortButton = this.page
      .locator('text="並び替え:"')
      .locator('..')
      .locator('button')
      .first();
    await sortButton.click();
  }

  /**
   * ソート項目を選択
   */
  async selectSortField(fieldName: string): Promise<void> {
    await this.openSortDropdown();
    const option = this.page.getByRole('option', { name: fieldName });
    await option.click();
    // ソート実行待機
    await this.page.waitForLoadState('networkidle');
  }

  // ==================== ページネーション操作 ====================

  /**
   * 文書件数情報を取得（例: "1-20 / 25 件の文書"）
   */
  async getFileCountInfo(): Promise<string | null> {
    return await this.page
      .locator('text=/^\\d+-\\d+ \\/ \\d+ 件の文書/')
      .textContent();
  }

  /**
   * ページネーションコントロールが表示されているか確認
   */
  async isPaginationVisible(): Promise<boolean> {
    const prevButton = this.page.getByRole('button', { name: /← Previous|前へ/ });
    return prevButton.isVisible().catch(() => false);
  }

  /**
   * 次ページボタンをクリック
   */
  async clickNextPage(): Promise<void> {
    const nextButton = this.page.getByRole('button', { name: /Next →|次へ/ });
    await nextButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * 前ページボタンをクリック
   */
  async clickPreviousPage(): Promise<void> {
    const prevButton = this.page.getByRole('button', { name: /← Previous|前へ/ });
    await prevButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * 指定したページ番号に移動
   */
  async goToPage(pageNumber: number): Promise<void> {
    const pageButton = this.page.getByRole('button', { name: pageNumber.toString() });
    await pageButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * 次ページボタンが有効か確認
   */
  async isNextPageEnabled(): Promise<boolean> {
    const nextButton = this.page.getByRole('button', { name: /Next →|次へ/ });
    const isDisabled = await nextButton.isDisabled();
    return !isDisabled;
  }

  /**
   * 前ページボタンが有効か確認
   */
  async isPreviousPageEnabled(): Promise<boolean> {
    const prevButton = this.page.getByRole('button', { name: /← Previous|前へ/ });
    const isDisabled = await prevButton.isDisabled();
    return !isDisabled;
  }

  // ==================== 検索操作 ====================

  /**
   * 検索バーにキーワードを入力
   */
  async search(keyword: string): Promise<void> {
    const searchInput = this.page.getByPlaceholder(/ファイル名で検索/);
    await searchInput.fill(keyword);
    // デバウンス処理待機（300ms + 余裕）
    await this.page.waitForTimeout(400);
  }

  /**
   * 検索をクリア
   */
  async clearSearch(): Promise<void> {
    const searchInput = this.page.getByPlaceholder(/ファイル名で検索/);
    await searchInput.clear();
    await this.page.waitForTimeout(400);
  }

  /**
   * 検索キーワードを取得
   */
  async getSearchKeyword(): Promise<string> {
    const searchInput = this.page.getByPlaceholder(/ファイル名で検索/);
    return (await searchInput.inputValue()) || '';
  }

  /**
   * ハイライト表示されているテキストが存在するか確認
   * @param text ハイライトされているべきテキスト
   */
  async hasHighlightedText(text: string): Promise<boolean> {
    // ハイライト用のスタイルが適用された要素を探す
    // 背景色 #fef9c3 または mark タグでハイライトされている
    const highlighted = this.page.locator(`mark:has-text("${text}")`);
    const count = await highlighted.count();
    
    if (count > 0) {
      return true;
    }
    
    // スタイル属性で背景色を確認
    const styledElements = this.page.locator(`span:has-text("${text}")`);
    const styledCount = await styledElements.count();
    
    for (let i = 0; i < styledCount; i++) {
      const bgColor = await styledElements.nth(i).evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });
      
      // #fef9c3 に近い色かチェック（RGB値）
      if (bgColor.includes('254, 249, 195') || bgColor.includes('rgb(254, 249, 195)')) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * 検索クリアボタン（×ボタン）をクリック
   */
  async clickSearchClearButton(): Promise<void> {
    // 検索入力フィールド内またはその近くのクリアボタンを探す
    const clearButton = this.page.locator('button[aria-label*="クリア"], button[aria-label*="clear"]').first();
    
    try {
      await clearButton.click();
    } catch {
      // クリアボタンがない場合は、検索フィールドをクリアする
      await this.clearSearch();
    }
    
    await this.page.waitForTimeout(400);
  }

  // ==================== フィルタ操作 ====================

  /**
   * タグをクリックして選択/解除
   */
  async toggleTag(tagName: string): Promise<void> {
    // タグコンテナ内から直接タグ要素を探す
    const tagChip = this.page.getByText(tagName, { exact: true });
    await tagChip.click();
    // タグフィルタ適用後、テーブルが更新されるまで待機
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(400);
  }

  /**
   * 開始日を入力
   */
  async setStartDate(date: string): Promise<void> {
    const startDateInput = this.page
      .locator('text="開始日"')
      .locator('..')
      .locator('input');
    await startDateInput.fill(date);
  }

  /**
   * 終了日を入力
   */
  async setEndDate(date: string): Promise<void> {
    const endDateInput = this.page
      .locator('text="終了日"')
      .locator('..')
      .locator('input');
    await endDateInput.fill(date);
  }

  // ==================== 状態確認 ====================

  /**
   * 空状態メッセージが表示されているか確認
   */
  async isEmptyMessageVisible(): Promise<boolean> {
    return this.page
      .getByText(/該当する文書が見つかりません|ファイルがありません/)
      .isVisible()
      .catch(() => false);
  }

  /**
   * エラーメッセージが表示されているか確認
   */
  async isErrorMessageVisible(): Promise<boolean> {
    return this.page
      .getByText(/エラーが発生しました|失敗/)
      .isVisible()
      .catch(() => false);
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
    return classes ? classes.includes('active') || classes.includes('selected') : false;
  }

  /**
   * URLクエリパラメータを取得
   */
  async getUrlSearchParams(paramName: string): Promise<string | null> {
    const url = this.page.url();
    const params = new URLSearchParams(url.split('?')[1]);
    return params.get(paramName);
  }

  /**
   * URLにクエリパラメータが含まれているか確認
   */
  async hasUrlParam(paramName: string): Promise<boolean> {
    return (await this.getUrlSearchParams(paramName)) !== null;
  }

  // ==================== ユーティリティ ====================

  /**
   * ページが読み込まれるまで待機
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * テーブルまたはグリッドが読み込まれるまで待機
   */
  async waitForContentLoad(): Promise<void> {
    const table = this.page.getByRole('table');
    const grid = this.page.locator('[role="grid"]');
    
    try {
      await Promise.race([
        table.isVisible({ timeout: 5000 }),
        grid.isVisible({ timeout: 5000 }),
      ]);
    } catch {
      // 両方見つからない場合も続行（空状態の可能性）
    }
  }

  /**
   * 最初の行が見える位置までスクロール
   */
  async scrollToFirstRow(): Promise<void> {
    const firstRow = this.getTableRows().first();
    await firstRow.scrollIntoViewIfNeeded();
  }
}
