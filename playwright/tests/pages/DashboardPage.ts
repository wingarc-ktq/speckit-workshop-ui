import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * ダッシュボードページのPage Object
 */
export class DashboardPage extends BasePage {
  readonly url = '/';

  constructor(page: Page) {
    super(page);
  }

  /**
   * ダッシュボードページが表示されているか確認
   */
  async isDashboardPage() {
    return this.page.getByTestId('filesPage').isVisible();
  }

  /**
   * ダッシュボードの見出しを取得
   */
  async getDashboardHeading() {
    return this.page
      .getByTestId('recentFilesSection')
      .getByText('最近使用したファイル', { exact: true });
  }

  /**
   * サイドバーのダッシュボードリンクが表示されているか確認
   */
  async isSidebarVisible() {
    return this.page.getByRole('link', { name: 'マイファイル' }).isVisible();
  }
}
