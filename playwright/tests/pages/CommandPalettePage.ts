import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * コマンドパレット（⌘K / Ctrl+K）のPage Object
 */
export class CommandPalettePage extends BasePage {
  readonly url = '/';

  constructor(page: Page) {
    super(page);
  }

  /**
   * ⌘K（Mac）/ Ctrl+K（Win/Linux）でコマンドパレットを開く
   */
  async open() {
    const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
    await this.page.keyboard.press(`${modifier}+k`);
  }

  /**
   * Escキーでコマンドパレットを閉じる
   */
  async close() {
    await this.page.keyboard.press('Escape');
  }

  /**
   * コマンドパレットのダイアログが表示されているか確認
   */
  async isOpen() {
    return await this.page.getByTestId('commandPalette').isVisible();
  }

  /**
   * 検索欄に入力欄がフォーカスされているか確認
   */
  async isInputFocused() {
    return await this.page
      .getByTestId('commandPaletteInput')
      .evaluate((element) => element === document.activeElement);
  }

  /**
   * 検索欄にキーワードを入力する
   */
  async fillSearch(keyword: string) {
    await this.page.getByTestId('commandPaletteInput').fill(keyword);
  }

  /**
   * 検索のデバウンス（300ms）が完了するまで待機する
   */
  async waitForSearchDebounce() {
    await this.page.waitForTimeout(350);
  }

  /**
   * 検索欄にキーワードを入力し、デバウンス完了まで待機する
   */
  async search(keyword: string) {
    await this.fillSearch(keyword);
    await this.waitForSearchDebounce();
  }

  /**
   * 候補行（すべて）を取得
   */
  getItems() {
    return this.page.getByTestId('commandPaletteItem');
  }

  /**
   * 候補行の件数を取得
   */
  async getItemCount() {
    return await this.getItems().count();
  }

  /**
   * 候補として表示されているファイル名の一覧を取得
   */
  async getItemNames() {
    return await this.getItems().allTextContents();
  }

  /**
   * 指定したファイル名の候補が表示されているか確認
   *
   * @remarks
   * ファイル名の完全一致で判定する（部分一致だと複数行にマッチし
   * strict modeエラーになりうるため、count() > 0 で真偽判定する）
   */
  async isItemVisible(fileName: string) {
    const count = await this.getItems()
      .getByText(fileName, { exact: true })
      .count();
    return count > 0;
  }

  /**
   * 候補が0件の場合に表示される要素（commandPaletteEmpty）が表示されているか確認
   */
  async isEmptyVisible() {
    return await this.page.getByTestId('commandPaletteEmpty').isVisible();
  }
}
