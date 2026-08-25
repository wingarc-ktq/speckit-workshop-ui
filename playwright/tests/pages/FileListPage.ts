import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * 文書一覧ページ（マイファイル画面）のPage Object
 */
export class FileListPage extends BasePage {
  readonly url = '/';

  constructor(page: Page) {
    super(page);
  }

  /**
   * 検索ボックスにキーワードを入力
   */
  async fillSearch(keyword: string) {
    await this.page.getByTestId('searchField').fill(keyword);
  }

  /**
   * 検索のデバウンス（300ms）が完了するまで待機する
   *
   * @remarks
   * デバウンス後に発生する一覧再取得の完了は、呼び出し側で
   * `expect.poll` 等の自動リトライ付きアサーションを使って確認すること
   * （`GET /api/v1/files` は「最近使用したファイル」等でも呼ばれるため、
   * レスポンス単体では「検索結果を反映した再取得」を一意に特定できない）
   */
  async waitForSearchDebounce() {
    await this.page.waitForTimeout(350);
  }

  /**
   * 検索ボックスにキーワードを入力し、デバウンス完了まで待機する
   */
  async search(keyword: string) {
    await this.fillSearch(keyword);
    await this.waitForSearchDebounce();
  }

  /**
   * 検索ボックスのクリアボタンをクリックし、デバウンス完了まで待機する
   */
  async clearSearch() {
    await this.page.getByTestId('searchClearButton').click();
    await this.waitForSearchDebounce();
  }

  /**
   * 文書一覧の全行（ヘッダー行を除く）を取得
   */
  getFileRows() {
    return this.page.locator('[role="row"][data-rowindex]');
  }

  /**
   * 文書一覧の行数を取得
   */
  async getFileRowCount() {
    return await this.getFileRows().count();
  }

  /**
   * 文書一覧に表示されているファイル名の一覧を取得
   */
  async getFileNames() {
    return await this.page
      .locator('[role="gridcell"][data-field="name"]')
      .allTextContents();
  }

  /**
   * 指定したファイル名の行が一覧に表示されているか確認
   *
   * @remarks
   * ファイル名の完全一致で判定する（部分一致だと複数行にマッチし
   * strict modeエラーになりうるため、count() > 0 で真偽判定する）
   */
  async isFileVisible(fileName: string) {
    const count = await this.page
      .locator('[role="gridcell"][data-field="name"]')
      .getByText(fileName, { exact: true })
      .count();
    return count > 0;
  }

  /**
   * 「Name」列ヘッダーをクリックしてソートする
   */
  async sortByName() {
    await this.page.getByRole('columnheader', { name: 'Name' }).click();
  }

  /**
   * Rows per page（1ページあたりの表示件数）を変更する
   *
   * @remarks
   * 変更後の一覧再取得の完了は、呼び出し側で `expect.poll` 等の
   * 自動リトライ付きアサーションを使って確認すること
   */
  async setRowsPerPage(size: 5 | 10 | 25) {
    await this.page.getByRole('combobox', { name: 'Rows per page:' }).click();
    await this.page
      .getByRole('option', { name: String(size), exact: true })
      .click();
  }

  /**
   * 次のページへ移動する
   *
   * @remarks
   * 移動後の一覧再取得の完了は、呼び出し側で `expect.poll` 等の
   * 自動リトライ付きアサーションを使って確認すること
   */
  async goToNextPage() {
    await this.page.getByRole('button', { name: 'Go to next page' }).click();
  }

  /**
   * 前のページへ移動する
   *
   * @remarks
   * 移動後の一覧再取得の完了は、呼び出し側で `expect.poll` 等の
   * 自動リトライ付きアサーションを使って確認すること
   */
  async goToPreviousPage() {
    await this.page
      .getByRole('button', { name: 'Go to previous page' })
      .click();
  }

  /**
   * 「Go to next page」ボタンが操作可能か確認
   */
  async isNextPageButtonEnabled() {
    return await this.page
      .getByRole('button', { name: 'Go to next page' })
      .isEnabled();
  }

  /**
   * 「Go to previous page」ボタンが操作可能か確認
   */
  async isPreviousPageButtonEnabled() {
    return await this.page
      .getByRole('button', { name: 'Go to previous page' })
      .isEnabled();
  }

  /**
   * ページネーションの表示件数テキスト（例: "1–5 of 7"）を取得
   */
  async getPaginationRangeText() {
    return await this.page
      .getByText(/^\d+[–-]\d+ of \d+$/)
      .first()
      .innerText();
  }

  /**
   * 検索結果が0件の場合に表示される要素（emptySearchResult）が表示されているか確認
   *
   * @remarks
   * 0件時のメッセージ文言はi18n設定により変わるため、テキストではなく
   * data-testid="emptySearchResult" の表示有無で判定する
   */
  async isEmptySearchResultVisible() {
    return await this.page.getByTestId('emptySearchResult').isVisible();
  }

  /**
   * テスト用ファイルをアップロードし、一覧に反映されるまで待機する
   *
   * @remarks
   * ファイルごとに `POST /api/v1/files` のレスポンスを待ってから
   * 次のファイルをアップロードする（1リクエストずつ確実に完了を待つため）。
   * `expectedRowCount` を指定した場合は、さらに一覧（DataGrid）の行数が
   * その件数になるまで待機し、一覧再取得の完了を保証する。
   *
   * @param filePaths アップロードするファイルパスの配列
   * @param expectedRowCount アップロード後に一覧へ表示されるべき行数
   *   （現在のページサイズ以下である必要がある）
   */
  async uploadFiles(filePaths: string[], expectedRowCount?: number) {
    for (const filePath of filePaths) {
      const uploadResponse = this.page.waitForResponse(
        (response) =>
          response.request().method() === 'POST' &&
          response.url().includes('/api/v1/files') &&
          response.ok()
      );
      await this.page.getByTestId('dropInput').setInputFiles(filePath);
      await uploadResponse;
    }

    if (expectedRowCount !== undefined) {
      await this.page.waitForFunction(
        (count) =>
          document.querySelectorAll('[role="row"][data-rowindex]').length ===
          count,
        expectedRowCount
      );
    }
  }
}
