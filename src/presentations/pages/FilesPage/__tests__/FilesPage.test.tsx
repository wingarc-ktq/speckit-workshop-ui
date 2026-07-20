import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { mockFileListResponse } from '@/__fixtures__/files';
import { mockTags } from '@/__fixtures__/tags';
import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';
import { i18n } from '@/i18n/config';

import { FilesPage } from '../FilesPage';

describe('FilesPage', () => {
  const getFiles = vi.fn();
  const getTags = vi.fn();

  const renderFilePage = async (initialEntries: string[] = ['/']) => {
    const r = render(
      <MemoryRouter initialEntries={initialEntries}>
        <RepositoryTestWrapper
          hasSuspense
          override={{
            files: {
              getFiles: getFiles,
            },
            tags: {
              getTags: getTags,
            },
          }}
        >
          <FilesPage />
        </RepositoryTestWrapper>
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(r.queryByTestId('suspense')).not.toBeInTheDocument()
    );
    return r;
  };

  beforeEach(async () => {
    await i18n.changeLanguage('ja');
    getFiles.mockResolvedValue(mockFileListResponse);
    getTags.mockResolvedValue(mockTags);
  });

  describe('基本的な表示', () => {
    test('FilesPageが表示されること', async () => {
      await renderFilePage();

      expect(screen.getByTestId('filesPage')).toBeInTheDocument();
    });

    test('RecentFilesSectionが表示されること', async () => {
      await renderFilePage();

      await waitFor(() =>
        expect(screen.getByTestId('recentFilesSection')).toBeInTheDocument()
      );
    });

    test('UploadSectionが表示されること', async () => {
      await renderFilePage();

      expect(screen.getByTestId('uploadSection')).toBeInTheDocument();
    });

    test('MyFilesSectionが表示されること', async () => {
      await renderFilePage();

      await waitFor(() =>
        expect(screen.getByTestId('myFilesSection')).toBeInTheDocument()
      );
    });
  });

  describe('検索時の表示', () => {
    test('検索クエリがある場合、RecentFilesSectionが表示されないこと', async () => {
      await renderFilePage(['/?search=pdf']);

      expect(
        screen.queryByTestId('recentFilesSection')
      ).not.toBeInTheDocument();
    });

    test('検索クエリがある場合、UploadSectionが表示されないこと', async () => {
      await renderFilePage(['/?search=pdf']);

      expect(screen.queryByTestId('uploadSection')).not.toBeInTheDocument();
    });

    test('検索クエリがある場合、MyFilesSectionは表示されること', async () => {
      await renderFilePage(['/?search=pdf']);

      await waitFor(() =>
        expect(screen.getByTestId('myFilesSection')).toBeInTheDocument()
      );
    });

    test('検索クエリがない場合、全てのセクションが表示されること', async () => {
      await renderFilePage();

      expect(screen.getByTestId('uploadSection')).toBeInTheDocument();
      await waitFor(() => {
        expect(screen.getByTestId('recentFilesSection')).toBeInTheDocument();
        expect(screen.getByTestId('myFilesSection')).toBeInTheDocument();
      });
    });
  });
});
