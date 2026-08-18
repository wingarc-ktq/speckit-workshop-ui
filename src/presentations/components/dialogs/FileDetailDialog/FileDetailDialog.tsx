import React, { useCallback, useEffect, useState } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { useTranslation } from 'react-i18next';

import type { FileId } from '@/domain/models/file';
import { tKeys } from '@/i18n/tKeys';
import { QueryBoundary } from '@/presentations/components/boundaries';
import { useDownloadFile } from '@/presentations/hooks/queries/files/useDownloadFile';
import { useFileById } from '@/presentations/hooks/queries/files/useFileById';
import { useTags } from '@/presentations/hooks/queries/tags/useTags';

import { FileEditDialog } from './components/FileEditDialog';
import { FileInfo } from './components/FileInfo';
import { FilePreview } from './components/FilePreview';
import * as S from './styled';

interface FileDetailDialogProps {
  /** 表示対象のファイルID。null 許容せず、開くときは必ず選択済みであること */
  fileId: FileId;
  onClose: () => void;
}

export const FileDetailDialog: React.FC<FileDetailDialogProps> = ({
  fileId,
  onClose,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      {/* タイトルと閉じるボタンは静的なため、境界の外で常に表示する */}
      <DialogTitle>
        <S.DialogTitleContainer>
          <S.Title>{t(tKeys.filesPage.fileDetailDialog.title)}</S.Title>
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            aria-label={t(tKeys.filesPage.fileDetailDialog.close)}
          >
            <CloseIcon />
          </IconButton>
        </S.DialogTitleContainer>
      </DialogTitle>
      <QueryBoundary
        skeleton={<FileDetailDialogBodySkeleton />}
        resetKeys={[fileId]}
      >
        <FileDetailDialogBody fileId={fileId} onClose={onClose} />
      </QueryBoundary>
    </Dialog>
  );
};

/**
 * ファイル詳細のデータ依存部分（プレビュー・情報・アクション）。
 *
 * @remarks
 * useFileById / useTags でのファイル取得（Suspense）を行う。ローディング・エラーは
 * 呼び出し側の QueryBoundary が扱い、タイトル・閉じるボタンは境界の外で常に表示される。
 */
const FileDetailDialogBody: React.FC<{
  fileId: FileId;
  onClose: () => void;
}> = ({ fileId, onClose }) => {
  const { t } = useTranslation();
  const { mutateAsync: downloadFile } = useDownloadFile();
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: file } = useFileById(fileId);
  const { data: tags } = useTags();

  const fileTags = tags.filter((tag) => file.tagIds.includes(tag.id));

  // ファイルをダウンロードしてプレビュー用URLを作成
  useEffect(() => {
    let objectUrl: string | null = null;

    const loadPreview = async () => {
      try {
        const blob = await downloadFile(fileId);
        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
      } catch (error) {
        console.error('Failed to load preview:', error);
      }
    };

    loadPreview();

    // クリーンアップ: Object URLを解放
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [fileId, downloadFile]);

  const handleDownloadClick = useCallback(async () => {
    try {
      const blob = await downloadFile(fileId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  }, [fileId, file.name, downloadFile]);

  const handleEditClick = useCallback(() => {
    setIsEditDialogOpen(true);
  }, []);

  const handleCloseEditDialog = useCallback(() => {
    setIsEditDialogOpen(false);
  }, []);

  return (
    <>
      <DialogContent dividers>
        <Stack spacing={3}>
          <FilePreview
            mimeType={file.mimeType}
            downloadUrl={file.downloadUrl}
            fileName={file.name}
            previewUrl={previewUrl}
          />
          <FileInfo file={file} tags={fileTags} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          {t(tKeys.filesPage.fileDetailDialog.close)}
        </Button>
        <Button startIcon={<EditIcon />} onClick={handleEditClick}>
          {t(tKeys.filesPage.fileDetailDialog.edit)}
        </Button>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadClick}
        >
          {t(tKeys.filesPage.fileDetailDialog.download)}
        </Button>
      </DialogActions>

      {isEditDialogOpen && (
        <FileEditDialog fileId={fileId} onClose={handleCloseEditDialog} />
      )}
    </>
  );
};

/**
 * ファイル詳細取得中に表示する本体スケルトン。
 *
 * @remarks
 * タイトル・閉じるボタンは境界の外で常に表示されるため、ここでは
 * プレビュー・情報・アクションのみを骨格表示する。
 */
const FileDetailDialogBodySkeleton: React.FC = () => {
  return (
    <>
      <DialogContent dividers data-testid="fileDetailDialogSkeleton">
        <Stack spacing={3}>
          <Skeleton variant="rounded" height={200} />
          <Stack spacing={1}>
            <Skeleton variant="text" width="40%" />
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="text" width="55%" />
            <Skeleton variant="text" width="60%" />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Skeleton variant="rounded" width={80} height={36} />
        <Skeleton variant="rounded" width={90} height={36} />
        <Skeleton variant="rounded" width={130} height={36} />
      </DialogActions>
    </>
  );
};
