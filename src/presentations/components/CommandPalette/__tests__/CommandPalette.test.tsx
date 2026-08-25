import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { filterMockFilesBySearch } from '@/__fixtures__/files';
import { mockTags } from '@/__fixtures__/tags';
import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';
import { i18n } from '@/i18n/config';

import { CommandPalette } from '../CommandPalette';

describe('CommandPalette', () => {
  const getFiles = vi.fn();
  const getTags = vi.fn();
  const getFileById = vi.fn();

  const renderCommandPalette = () => {
    return render(
      <MemoryRouter>
        <RepositoryTestWrapper
          hasSuspense
          override={{
            files: {
              getFiles: getFiles,
              getFileById: getFileById,
            },
            tags: {
              getTags: getTags,
            },
          }}
        >
          <CommandPalette />
        </RepositoryTestWrapper>
      </MemoryRouter>
    );
  };

  /** window に Ctrl+K の keydown イベントを発火し、コマンドパレットを開く */
  const openPalette = () => {
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
  };

  beforeEach(async () => {
    await i18n.changeLanguage('ja');

    // 検索クエリに応じてフィルタリングされたデータを返す
    getFiles.mockImplementation((params) => {
      return Promise.resolve(filterMockFilesBySearch(params?.search));
    });
    getTags.mockResolvedValue(mockTags);
    getFileById.mockImplementation((fileId: string) => {
      const allFiles = filterMockFilesBySearch(undefined);
      const file = allFiles.files.find((f) => f.id === fileId);
      return Promise.resolve(file ?? null);
    });
  });

  describe('開閉', () => {
    test('初期状態ではダイアログが表示されないこと', () => {
      renderCommandPalette();

      expect(screen.queryByTestId('commandPalette')).not.toBeInTheDocument();
    });

    test('Ctrl+K でダイアログが開くこと', async () => {
      renderCommandPalette();

      openPalette();

      await waitFor(() => {
        expect(screen.getByTestId('commandPalette')).toBeInTheDocument();
      });
    });

    test('開いた瞬間に入力欄へフォーカスが当たること', async () => {
      renderCommandPalette();

      openPalette();

      await waitFor(() => {
        expect(screen.getByTestId('commandPaletteInput')).toHaveFocus();
      });
    });

    test('Escキーで閉じること', async () => {
      const user = userEvent.setup();
      renderCommandPalette();
      openPalette();
      await waitFor(() => {
        expect(screen.getByTestId('commandPalette')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(
          screen.queryByTestId('commandPalette')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('検索', () => {
    test('入力すると候補が絞り込まれること', async () => {
      const user = userEvent.setup();
      renderCommandPalette();
      openPalette();

      const input = await screen.findByTestId('commandPaletteInput');
      await user.type(input, 'contract');

      await waitFor(
        () => {
          const items = screen.getAllByTestId('commandPaletteItem');
          expect(items).toHaveLength(1);
          expect(items[0]).toHaveTextContent('contract.docx');
        },
        { timeout: 1000 }
      );
    });

    test('候補が0件のとき「該当する文書が見つかりませんでした」を表示すること', async () => {
      const user = userEvent.setup();
      renderCommandPalette();
      openPalette();

      const input = await screen.findByTestId('commandPaletteInput');
      await user.type(input, '存在しないキーワードXYZ');

      await waitFor(
        () => {
          expect(
            screen.getByTestId('commandPaletteEmpty')
          ).toHaveTextContent('該当する文書が見つかりませんでした');
        },
        { timeout: 1000 }
      );
    });
  });

  describe('キーボード操作', () => {
    test('開いた直後は先頭の候補が選択状態であること', async () => {
      renderCommandPalette();
      openPalette();

      const items = await screen.findAllByTestId('commandPaletteItem');
      expect(items[0]).toHaveClass('Mui-selected');
    });

    test('↓キーで選択行が1つ下に移動すること', async () => {
      const user = userEvent.setup();
      renderCommandPalette();
      openPalette();

      const items = await screen.findAllByTestId('commandPaletteItem');
      expect(items[0]).toHaveClass('Mui-selected');

      await user.keyboard('{ArrowDown}');

      expect(items[1]).toHaveClass('Mui-selected');
      expect(items[0]).not.toHaveClass('Mui-selected');
    });

    test('↑キーで選択行が1つ上に移動すること', async () => {
      const user = userEvent.setup();
      renderCommandPalette();
      openPalette();

      const items = await screen.findAllByTestId('commandPaletteItem');
      await user.keyboard('{ArrowDown}{ArrowDown}');
      expect(items[2]).toHaveClass('Mui-selected');

      await user.keyboard('{ArrowUp}');

      expect(items[1]).toHaveClass('Mui-selected');
      expect(items[2]).not.toHaveClass('Mui-selected');
    });

    test('Enterで選択中のファイルの詳細ダイアログが開き、コマンドパレットが閉じること', async () => {
      const user = userEvent.setup();
      renderCommandPalette();
      openPalette();

      await screen.findAllByTestId('commandPaletteItem');

      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('ファイル詳細')).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(
          screen.queryByTestId('commandPalette')
        ).not.toBeInTheDocument();
      });
    });
  });
});
