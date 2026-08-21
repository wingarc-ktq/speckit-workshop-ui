import { Box, Card, CardContent, CardMedia, Typography, Chip, Checkbox } from '@mui/material';
import {
  Description as DescriptionIcon,
  FilePresent as FilePresentIcon,
  DataObject as DataObjectIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { useState } from 'react';

import type { FileInfo } from '@/adapters/generated/files';
import { getTagInfo } from '@/domain/constants/tags';

interface DocumentGridViewProps {
  files: FileInfo[];
  selectedTags?: string[];
}

// ファイルタイプに応じたアイコンと色を取得
interface FileTypeInfo {
  icon: React.ReactNode;
  backgroundColor: string;
  iconColor: string;
}

const getFileTypeInfo = (mimeType: string, fileName: string): FileTypeInfo => {
  const fileExt = fileName.split('.').pop()?.toLowerCase() || '';

  // PDF
  if (mimeType.includes('pdf') || fileExt === 'pdf') {
    return {
      icon: <DescriptionIcon sx={{ fontSize: 48 }} />,
      backgroundColor: '#fee2e2', // Red light
      iconColor: '#dc2626', // Red
    };
  }

  // Excel/Spreadsheet
  if (
    mimeType.includes('sheet') ||
    mimeType.includes('spreadsheet') ||
    fileExt === 'xlsx' ||
    fileExt === 'xls' ||
    fileExt === 'csv'
  ) {
    return {
      icon: <DataObjectIcon sx={{ fontSize: 48 }} />,
      backgroundColor: '#dcfce7', // Green light
      iconColor: '#15803d', // Green
    };
  }

  // Word/Document
  if (
    mimeType.includes('word') ||
    mimeType.includes('document') ||
    fileExt === 'docx' ||
    fileExt === 'doc'
  ) {
    return {
      icon: <FilePresentIcon sx={{ fontSize: 48 }} />,
      backgroundColor: '#dbeafe', // Blue light
      iconColor: '#0284c7', // Blue
    };
  }

  // Image
  if (mimeType.includes('image') || fileExt === 'jpg' || fileExt === 'png' || fileExt === 'gif') {
    return {
      icon: <ImageIcon sx={{ fontSize: 48 }} />,
      backgroundColor: '#fef3c7', // Yellow light
      iconColor: '#d97706', // Yellow/Amber
    };
  }

  // Default
  return {
    icon: <DescriptionIcon sx={{ fontSize: 48 }} />,
    backgroundColor: '#f3f4f6', // Gray light
    iconColor: '#6b7280', // Gray
  };
};

const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

/**
 * ファイルをグリッド表示するコンポーネント
 */
export const DocumentGridView: React.FC<DocumentGridViewProps> = ({ files }) => {
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  const toggleSelectFile = (fileId: string) => {
    setSelectedFiles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)',
        },
        gap: 2,
      }}
    >
      {files.map((file) => {
        const fileTypeInfo = getFileTypeInfo(file.mimeType, file.name);
        const isSelected = selectedFiles.has(file.id);

        return (
          <Card
            key={file.id}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              '&:hover': {
                boxShadow: 3,
                transform: 'translateY(-2px)',
                transition: 'all 0.3s ease',
              },
            }}
          >
            {/* 右上のチェックボックス */}
            <Checkbox
              checked={isSelected}
              onChange={() => toggleSelectFile(file.id)}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 10,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: '#fff',
                },
              }}
            />

            {/* ファイルアイコン */}
            <CardMedia
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: fileTypeInfo.backgroundColor,
                height: 120,
              }}
            >
              <Box sx={{ color: fileTypeInfo.iconColor }}>
                {fileTypeInfo.icon}
              </Box>
            </CardMedia>

            {/* コンテンツ */}
            <CardContent sx={{ flex: 1, pb: 1 }}>
              {/* ファイル名 */}
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  mb: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {file.name}
              </Typography>

              {/* タグ */}
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                {file.tagIds &&
                  file.tagIds.map((tagId) => {
                    const tag = getTagInfo(tagId);
                    return (
                      <Chip
                        key={tag.id}
                        label={tag.name}
                        size="small"
                        sx={{
                          backgroundColor: tag.backgroundColor,
                          color: tag.color,
                          fontWeight: 500,
                          fontSize: '12px',
                          height: '24px',
                          borderRadius: '6px',
                          padding: '2px 8px',
                          '& .MuiChip-label': {
                            padding: '0',
                          },
                        }}
                      />
                    );
                  })}
              </Box>

              {/* ファイル情報（サイズと日付） */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                <Typography variant="caption" sx={{ color: '#999' }}>
                  {formatSize(file.size)}
                </Typography>
                <Typography variant="caption" sx={{ color: '#999' }}>
                  {formatDate(file.uploadedAt)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
};
