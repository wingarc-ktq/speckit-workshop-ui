import React, { useCallback, useEffect, useState } from 'react';

import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import Skeleton from '@mui/material/Skeleton';
import { useTranslation } from 'react-i18next';

import type { DocumentFile, FileId } from '@/domain/models/file';
import { tKeys } from '@/i18n/tKeys';
import { QueryBoundary } from '@/presentations/components/boundaries';
import { FileDetailDialog } from '@/presentations/components/dialogs/FileDetailDialog';
import { useFiles } from '@/presentations/hooks/queries/files/useFiles';
import { useDebounce } from '@/presentations/hooks/useDebounce';

import * as S from './styled';

/** コマンドパレットの検索結果として取得する最大件数 */
const RESULT_LIMIT = 10;

/** スケルトン表示時のプレースホルダ行数 */
const SKELETON_ROW_COUNT = 4;

/**
 * Raycast風のコマンドパレット（⌘K / Ctrl+K）
 *
 * @remarks
 * どの画面からでも開けるよう AppLayout に配置される。開閉状態やアップロードの
 * ステータスに関わらず window の keydown を監視し続けるため、AppLayout配下で
 * 常時マウントされている前提のコンポーネント。
 */
export const CommandPalette: React.FC = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [items, setItems] = useState<DocumentFile[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [openFileId, setOpenFileId] = useState<FileId | null>(null);

  const debouncedQuery = useDebounce(inputValue, 300);

  // 検索キーワードが変わったら選択位置を先頭に戻す
  useEffect(() => {
    setSelectedIndex(0);
  }, [debouncedQuery]);

  // ⌘K / Ctrl+K でコマンドパレットを開くグローバルショートカット
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      const isShortcut =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
      if (!isShortcut) return;

      event.preventDefault();
      setOpen(true);
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setInputValue('');
    setItems([]);
    setSelectedIndex(0);
  }, []);

  const handleSelectFile = useCallback(
    (fileId: FileId) => {
      setOpenFileId(fileId);
      handleClose();
    },
    [handleClose]
  );

  const handleInputKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (event.key === 'Enter') {
        event.preventDefault();
        const target = items[selectedIndex];
        if (target) {
          handleSelectFile(target.id);
        }
      }
    },
    [items, selectedIndex, handleSelectFile]
  );

  return (
    <>
      <S.StyledDialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        data-testid="commandPalette"
      >
        <S.SearchField
          autoFocus
          fullWidth
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder={t(tKeys.commandPalette.inputPlaceholder)}
          slotProps={{
            htmlInput: {
              'data-testid': 'commandPaletteInput',
            },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            },
          }}
        />

        {open && (
          <QueryBoundary
            skeleton={<CommandPaletteSkeleton />}
            resetKeys={[debouncedQuery]}
          >
            <CommandPaletteResults
              query={debouncedQuery}
              selectedIndex={selectedIndex}
              onItemsChange={setItems}
              onSelectFile={handleSelectFile}
            />
          </QueryBoundary>
        )}
      </S.StyledDialog>

      {openFileId !== null && (
        <FileDetailDialog
          fileId={openFileId}
          onClose={() => setOpenFileId(null)}
        />
      )}
    </>
  );
};

interface CommandPaletteResultsProps {
  query: string;
  selectedIndex: number;
  onItemsChange: (items: DocumentFile[]) => void;
  onSelectFile: (fileId: FileId) => void;
}

/**
 * コマンドパレットの検索結果部分。
 *
 * @remarks
 * useFiles でのファイル取得（Suspense）を行う。ローディングは呼び出し側の
 * QueryBoundary が扱う。取得結果は onItemsChange で親（CommandPalette）に
 * 通知し、親側で管理しているキーボード操作（↑↓/Enter）から参照できるようにする。
 */
const CommandPaletteResults: React.FC<CommandPaletteResultsProps> = ({
  query,
  selectedIndex,
  onItemsChange,
  onSelectFile,
}) => {
  const { t } = useTranslation();
  const { data } = useFiles({
    search: query || undefined,
    limit: RESULT_LIMIT,
  });

  useEffect(() => {
    onItemsChange(data.files);
  }, [data.files, onItemsChange]);

  if (data.files.length === 0) {
    return (
      <S.EmptyState data-testid="commandPaletteEmpty">
        <S.EmptyStateTitle>
          {t(tKeys.commandPalette.empty.title)}
        </S.EmptyStateTitle>
      </S.EmptyState>
    );
  }

  return (
    <S.ResultsList data-testid="commandPaletteList">
      {data.files.map((file, index) => (
        <S.ResultItem
          key={file.id}
          selected={index === selectedIndex}
          onClick={() => onSelectFile(file.id)}
          data-testid="commandPaletteItem"
        >
          <S.ResultItemText primary={file.name} />
        </S.ResultItem>
      ))}
    </S.ResultsList>
  );
};

/** データ取得中に表示するスケルトン */
const CommandPaletteSkeleton: React.FC = () => (
  <S.ResultsList data-testid="commandPaletteSkeleton" aria-busy="true">
    {Array.from({ length: SKELETON_ROW_COUNT }).map((_, index) => (
      <S.SkeletonRow key={index}>
        <Skeleton variant="text" width="70%" />
      </S.SkeletonRow>
    ))}
  </S.ResultsList>
);
