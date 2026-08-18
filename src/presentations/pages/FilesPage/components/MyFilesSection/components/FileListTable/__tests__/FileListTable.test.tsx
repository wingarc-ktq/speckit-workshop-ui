import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach } from 'vitest';

import { mockFileListResponse } from '@/__fixtures__/files';
import { mockTags } from '@/__fixtures__/tags';
import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';
import { i18n } from '@/i18n/config';

import { FileListTable } from '../FileListTable';

import type { GridPaginationModel } from '@mui/x-data-grid';

describe('FileListTable', () => {
  const getTags = vi.fn();
  const onPaginationModelChange = vi.fn();

  const defaultPaginationModel: GridPaginationModel = {
    page: 0,
    pageSize: 10,
  };

  const renderFileListTable = async (
    props?: Partial<React.ComponentProps<typeof FileListTable>>
  ) => {
    const defaultProps = {
      files: mockFileListResponse.files,
      total: 3,
      paginationModel: defaultPaginationModel,
      onPaginationModelChange,
      ...props,
    };

    const r = render(
      <RepositoryTestWrapper
        hasSuspense
        override={{
          tags: {
            getTags,
          },
        }}
      >
        <FileListTable {...defaultProps} />
      </RepositoryTestWrapper>
    );

    // Suspenseの解決を待つ
    await waitFor(() =>
      expect(r.queryByTestId('suspense')).not.toBeInTheDocument()
    );

    return r;
  };

  beforeEach(async () => {
    await i18n.changeLanguage('ja');
    getTags.mockResolvedValue(mockTags);
  });

  test('データグリッドが表示される', async () => {
    await renderFileListTable();

    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  test('ファイルデータが表示される', async () => {
    await renderFileListTable();

    // ファイル名が表示される
    await waitFor(() => {
      expect(
        screen.getByText(mockFileListResponse.files[0].name)
      ).toBeInTheDocument();
    });
  });

  test('空のファイルリストの場合、"No rows"メッセージが表示される', async () => {
    await renderFileListTable({ files: [], total: 0 });

    expect(screen.getByRole('grid')).toBeInTheDocument();
    expect(screen.getByText(/no rows/i)).toBeInTheDocument();
  });
});
