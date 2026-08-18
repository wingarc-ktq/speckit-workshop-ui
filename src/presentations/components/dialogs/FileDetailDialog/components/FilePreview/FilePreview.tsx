import React from 'react';

import { useTranslation } from 'react-i18next';

import { tKeys } from '@/i18n/tKeys';
import { FileType, getFileType } from '@/presentations/utils/fileFormatters';

import * as S from './styled';

interface FilePreviewProps {
  mimeType: string;
  downloadUrl: string;
  fileName: string;
  previewUrl?: string | null;
}

export const FilePreview: React.FC<FilePreviewProps> = ({
  mimeType,
  downloadUrl,
  fileName,
  previewUrl,
}) => {
  const { t } = useTranslation();
  const fileType = getFileType(mimeType);

  // PDFプレビュー
  if (fileType === FileType.PDF) {
    // previewUrlがある場合はPDFを埋め込み表示
    if (previewUrl) {
      return (
        <S.PdfEmbedContainer>
          <S.PdfEmbed src={previewUrl} title={fileName} />
        </S.PdfEmbedContainer>
      );
    }

    // previewUrlがない場合（ローディング中）はアイコンを表示
    return (
      <S.PreviewContainer>
        <S.PdfIcon />
        <S.PreviewMessageTitle>
          {t(tKeys.filesPage.fileDetailDialog.preview.pdf.title)}
        </S.PreviewMessageTitle>
        <S.PreviewMessageDescription>
          {t(tKeys.filesPage.fileDetailDialog.preview.pdf.description)}
        </S.PreviewMessageDescription>
      </S.PreviewContainer>
    );
  }

  // 画像プレビュー
  if (fileType === FileType.IMAGE) {
    return (
      <S.ImagePreviewContainer>
        <S.PreviewImage src={downloadUrl} alt={fileName} />
      </S.ImagePreviewContainer>
    );
  }

  // その他のファイルタイプ
  return (
    <S.PreviewContainer>
      {fileType === FileType.WORD ? (
        <S.WordIcon />
      ) : fileType === FileType.EXCEL ? (
        <S.ExcelIcon />
      ) : (
        <S.OtherFileIcon />
      )}
      <S.PreviewMessageTitle>
        {t(tKeys.filesPage.fileDetailDialog.preview.unsupported.title)}
      </S.PreviewMessageTitle>
      <S.PreviewMessageDescription>
        {t(tKeys.filesPage.fileDetailDialog.preview.unsupported.description)}
      </S.PreviewMessageDescription>
    </S.PreviewContainer>
  );
};
