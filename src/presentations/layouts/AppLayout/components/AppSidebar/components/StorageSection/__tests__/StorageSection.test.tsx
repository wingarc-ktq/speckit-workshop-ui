import { render, screen } from '@testing-library/react';

import { i18n } from '@/i18n/config';

import { StorageSection } from '../StorageSection';

const renderStorageSection = () => {
  return render(<StorageSection />);
};

describe('StorageSection', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ja');
  });

  describe('多言語リソースの確認', () => {
    describe('i18n: layouts.appSidebar.storage.title', () => {
      test('locale:ja "ストレージ" が表示される', () => {
        renderStorageSection();

        expect(screen.getByText('ストレージ')).toBeInTheDocument();
      });
    });

    describe('i18n: layouts.appSidebar.storage.upgrade', () => {
      test('locale:ja "アップグレード" ボタンが表示される', () => {
        renderStorageSection();

        expect(
          screen.getByRole('button', { name: 'アップグレード' })
        ).toBeInTheDocument();
      });
    });

    describe('i18n: layouts.appSidebar.storage.usage', () => {
      test('locale:ja "0.0 GB / 15 GB" の使用量が表示される', () => {
        renderStorageSection();

        expect(screen.getByText('0.0 GB / 15 GB')).toBeInTheDocument();
      });
    });
  });

  describe('初期表示', () => {
    test('ストレージセクションが正しくレンダリングされる', () => {
      renderStorageSection();

      // セクションタイトル
      expect(screen.getByText('ストレージ')).toBeInTheDocument();

      // アップグレードボタン
      expect(
        screen.getByRole('button', { name: 'アップグレード' })
      ).toBeInTheDocument();

      // 使用量表示
      expect(screen.getByText('0.0 GB / 15 GB')).toBeInTheDocument();
    });

    test('プログレスバーが表示される', () => {
      const { container } = renderStorageSection();

      // MUIのLinearProgressコンポーネントを検証
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('数値フォーマット', () => {
    test('使用量が小数点第1位まで表示される', () => {
      renderStorageSection();

      // storageUsed.toFixed(1) により 0.02 -> "0.0" となる
      expect(screen.getByText('0.0 GB / 15 GB')).toBeInTheDocument();
    });

    test('総容量が整数で表示される', () => {
      renderStorageSection();

      // storageTotal: 15 は整数のまま表示される
      const usageText = screen.getByText('0.0 GB / 15 GB');
      expect(usageText).toBeInTheDocument();
    });
  });
});
