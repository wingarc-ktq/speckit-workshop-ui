import Box from '@mui/material/Box';

import { DocumentGridView, FileList } from '@/presentations/components/files';
import { useFileListQuery } from '@/presentations/hooks/queries/files/useFileListQuery';
import type { SortBy, SortOrder, ViewMode } from '@/presentations/hooks/useDocumentManagementState';

import { filterFiles } from '../utils/filterFiles';

export const PAGE_SIZE = 20;

export interface FileListContentProps {
  viewMode: ViewMode;
  searchQuery?: string;
  sortBy: SortBy;
  sortOrder: SortOrder;
  selectedTags: string[];
  startDate: string;
  endDate: string;
  currentPage: number;
}

export const FileListContent: React.FC<FileListContentProps> = ({
  viewMode,
  searchQuery,
  sortBy,
  sortOrder,
  selectedTags,
  startDate,
  endDate,
  currentPage,
}) => {
  const { data, isPending } = useFileListQuery({ search: searchQuery });
  const isSearching = Boolean(searchQuery);

  // 初回ロード中
  if (isPending && !data) {
    return <Box sx={{ p: 2 }}>読み込み中...</Box>;
  }

  // データがない場合は空配列
  if (!data?.files) {
    return <Box sx={{ p: 2 }}>データがありません</Box>;
  }

  const filteredFiles = filterFiles(data.files, { selectedTags, startDate, endDate });

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    if (sortBy === 'name') {
      const comparison = a.name.localeCompare(b.name, 'ja');
      return sortOrder === 'asc' ? comparison : -comparison;
    }
    if (sortBy === 'size') {
      const comparison = a.size - b.size;
      return sortOrder === 'asc' ? comparison : -comparison;
    }
    const comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // ページネーション処理
  const totalCount = sortedFiles.length;
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, totalCount);
  const paginatedFiles = sortedFiles.slice(startIndex, endIndex);

  if (viewMode === 'grid') {
    return (
      <Box sx={{ p: 2 }}>
        <DocumentGridView files={paginatedFiles} />
      </Box>
    );
  }

  return <FileList files={paginatedFiles} isSearching={isSearching} searchQuery={searchQuery} />;
};
