import Box from '@mui/material/Box';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from 'use-debounce';

import { FiltersPanel } from './components/FiltersPanel';
import { FileListContent, PAGE_SIZE } from './components/FileListContent';
import { PaginationControls } from './components/PaginationControls';
import { SearchBar } from './components/SearchBar';
import { SortToolbar } from './components/SortToolbar';
import { UploadDialog } from './components/UploadDialog';
import { useDocumentManagementState } from '@/presentations/hooks/useDocumentManagementState';
import { useFileListQuery } from '@/presentations/hooks/queries/files/useFileListQuery';

export const DocumentManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, actions] = useDocumentManagementState();

  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [debouncedSearchQuery] = useDebounce(searchInput, 300);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (debouncedSearchQuery) {
      setSearchParams({ search: debouncedSearchQuery }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [debouncedSearchQuery, setSearchParams]);

  const handleToggleTag = useCallback((tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  }, []);

  const handleChangePage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // フィルタリング後の件数を計算（ページネーション用）
  const { data } = useFileListQuery({ search: debouncedSearchQuery });
  const filteredCount = useMemo(() => {
    if (!data?.files) return 0;
    
    let filtered = [...data.files];
    
    if (selectedTags.length > 0) {
      filtered = filtered.filter((file) =>
        file.tagIds ? selectedTags.some((tag) => file.tagIds?.includes(tag)) : false,
      );
    }
    
    if (startDate || endDate) {
      filtered = filtered.filter((file) => {
        const fileDate = new Date(file.uploadedAt);
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (fileDate < start) return false;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (fileDate > end) return false;
        }
        return true;
      });
    }
    
    return filtered.length;
  }, [data?.files, selectedTags, startDate, endDate]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <SearchBar
          placeholder={t('fileList.search.placeholder')}
          value={searchInput}
          onChange={setSearchInput}
          onOpenUpload={actions.openUploadDialog}
        />

        <FiltersPanel
          selectedTags={selectedTags}
          onToggleTag={handleToggleTag}
          startDate={startDate}
          endDate={endDate}
          onChangeStartDate={setStartDate}
          onChangeEndDate={setEndDate}
        />

        <Box sx={{ flex: 1, px: 3, py: 2, overflow: 'auto' }}>
          <SortToolbar
            sortBy={state.sortBy}
            sortOrder={state.sortOrder}
            viewMode={state.viewMode}
            currentPage={currentPage}
            pageSize={PAGE_SIZE}
            totalCount={filteredCount}
            onChangeSortBy={actions.setSortBy}
            onToggleSortOrder={actions.toggleSortOrder}
            onChangeViewMode={actions.setViewMode}
          />

          <FileListContent
            viewMode={state.viewMode}
            searchQuery={debouncedSearchQuery}
            sortBy={state.sortBy}
            sortOrder={state.sortOrder}
            selectedTags={selectedTags}
            startDate={startDate}
            endDate={endDate}
            currentPage={currentPage}
          />
        </Box>

        <PaginationControls 
          currentPage={currentPage} 
          totalCount={filteredCount}
          pageSize={PAGE_SIZE}
          onChangePage={handleChangePage} 
        />

        <UploadDialog open={state.isUploadDialogOpen} onClose={actions.closeUploadDialog} />
      </Box>
    </Box>
  );
};

