import React, { useState } from 'react';

import Alert from '@mui/material/Alert';
import { useTranslation } from 'react-i18next';

import { FileUploadStatus, type UploadingFile } from '@/domain/models/file';
import { tKeys } from '@/i18n/tKeys';
import { useUploadFile } from '@/presentations/hooks/queries/files/useUploadFile';

import { FileUploadList, FileUploadZone } from './components';
import * as S from './styled';

export const UploadSection: React.FC = () => {
  const { t } = useTranslation();
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { mutateAsync: uploadFile } = useUploadFile();

  const handleFilesAccepted = async (files: File[]) => {
    setErrorMessage(null);

    // 最大20ファイルのチェック
    if (uploadingFiles.length + files.length > 20) {
      setErrorMessage(t(tKeys.filesPage.uploadSection.maxFilesError));
      return;
    }

    // アップロードキューに追加
    const newUploadingFiles: UploadingFile[] = files.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      progress: 0,
      status: FileUploadStatus.UPLOADING,
    }));

    setUploadingFiles((prev) => [...prev, ...newUploadingFiles]);

    // 各ファイルをアップロード
    for (const uploadingFile of newUploadingFiles) {
      try {
        // プログレス更新のシミュレーション
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.id === uploadingFile.id ? { ...f, progress: 30 } : f
          )
        );

        await uploadFile({
          file: uploadingFile.file,
        });

        // 成功時の更新
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.id === uploadingFile.id
              ? { ...f, progress: 100, status: FileUploadStatus.SUCCESS }
              : f
          )
        );

        // 成功後3秒でリストから削除
        setTimeout(() => {
          setUploadingFiles((prev) =>
            prev.filter((f) => f.id !== uploadingFile.id)
          );
        }, 3000);
      } catch (error) {
        // エラー時の更新
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.id === uploadingFile.id
              ? {
                  ...f,
                  status: FileUploadStatus.ERROR,
                  error:
                    error instanceof Error
                      ? error.message
                      : t(tKeys.filesPage.uploadSection.uploadFailed),
                }
              : f
          )
        );
      }
    }
  };

  const handleFilesRejected = (files: File[]) => {
    const messages = files.map((file) => file.name).join(', ');
    setErrorMessage(
      t(tKeys.filesPage.uploadSection.unsupportedFilesError, {
        files: messages,
      })
    );
  };

  const handleRemoveFile = (id: string) => {
    setUploadingFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const isUploading = uploadingFiles.some(
    (f) => f.status === FileUploadStatus.UPLOADING
  );

  return (
    <S.Container data-testid="uploadSection">
      <S.Title>{t(tKeys.filesPage.uploadSection.title)}</S.Title>

      {errorMessage && (
        <Alert severity="error" onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}

      <FileUploadZone
        onFilesAccepted={handleFilesAccepted}
        onFilesRejected={handleFilesRejected}
        maxFiles={20}
        disabled={isUploading}
      />

      <FileUploadList files={uploadingFiles} onRemoveFile={handleRemoveFile} />
    </S.Container>
  );
};
