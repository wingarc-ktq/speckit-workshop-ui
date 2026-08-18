import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { i18n } from '@/i18n/config';

import { GeneralSection } from '../GeneralSection';

const renderGeneralSection = (initialRoute = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <GeneralSection />
    </MemoryRouter>
  );
};

describe('GeneralSection', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ja');
  });

  describe('多言語リソースの確認', () => {
    describe('i18n: layouts.appSidebar.general.title', () => {
      test('locale:ja "一般" が表示される', () => {
        renderGeneralSection();
        expect(screen.getByText('一般')).toBeInTheDocument();
      });
    });

    describe('i18n: layouts.appSidebar.general.myFiles', () => {
      test('locale:ja "マイファイル" が表示される', () => {
        renderGeneralSection();
        expect(screen.getByText('マイファイル')).toBeInTheDocument();
      });
    });

    describe('i18n: layouts.appSidebar.general.recent', () => {
      test('locale:ja "最近使用したファイル" が表示される', () => {
        renderGeneralSection();
        expect(screen.getByText('最近使用したファイル')).toBeInTheDocument();
      });
    });

    describe('i18n: layouts.appSidebar.general.sharedWithMe', () => {
      test('locale:ja "共有アイテム" が表示される', () => {
        renderGeneralSection();
        expect(screen.getByText('共有アイテム')).toBeInTheDocument();
      });
    });

    describe('i18n: layouts.appSidebar.general.deletedFiles', () => {
      test('locale:ja "ゴミ箱" が表示される', () => {
        renderGeneralSection();
        expect(screen.getByText('ゴミ箱')).toBeInTheDocument();
      });
    });
  });

  describe('ナビゲーションリンクの検証', () => {
    test('マイファイルリンクが正しいパスを指している', () => {
      renderGeneralSection();
      const myFilesLink = screen.getByText('マイファイル').closest('a');
      expect(myFilesLink).toHaveAttribute('href', '/');
    });

    test('最近使用したファイルリンクが正しいパスを指している', () => {
      renderGeneralSection();
      const recentLink = screen.getByText('最近使用したファイル').closest('a');
      expect(recentLink).toHaveAttribute('href', '/recent');
    });

    test('共有アイテムリンクが正しいパスを指している', () => {
      renderGeneralSection();
      const sharedLink = screen.getByText('共有アイテム').closest('a');
      expect(sharedLink).toHaveAttribute('href', '/shared');
    });

    test('ゴミ箱リンクが正しいパスを指している', () => {
      renderGeneralSection();
      const deletedLink = screen.getByText('ゴミ箱').closest('a');
      expect(deletedLink).toHaveAttribute('href', '/deleted');
    });
  });

  describe('現在のルートとの連動', () => {
    test('/ ルートではマイファイルが選択状態になる', () => {
      renderGeneralSection('/');
      const myFilesLink = screen.getByText('マイファイル').closest('a');
      expect(myFilesLink).toHaveClass('active');
    });

    test('/recent ルートでは最近使用したファイルが選択状態になる', () => {
      renderGeneralSection('/recent');
      const recentLink = screen.getByText('最近使用したファイル').closest('a');
      expect(recentLink).toHaveClass('active');
    });

    test('/shared ルートでは共有アイテムが選択状態になる', () => {
      renderGeneralSection('/shared');
      const sharedLink = screen.getByText('共有アイテム').closest('a');
      expect(sharedLink).toHaveClass('active');
    });

    test('/deleted ルートではゴミ箱が選択状態になる', () => {
      renderGeneralSection('/deleted');
      const deletedLink = screen.getByText('ゴミ箱').closest('a');
      expect(deletedLink).toHaveClass('active');
    });

    test('関連のないルートでは何も選択されていない', () => {
      renderGeneralSection('/other');
      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        expect(link).not.toHaveClass('active');
      });
    });
  });
});
