import { Box, Checkbox, Chip, TableCell, TableRow, Typography } from '@mui/material';
import { Description as DescriptionIcon, FilePresent as FilePresentIcon, DataObject as DataObjectIcon } from '@mui/icons-material';

import type { FileInfo } from '@/adapters/generated/files';
import { getTagInfo } from '@/domain/constants/tags';

interface FileListItemProps {
  file: FileInfo;
  isLast?: boolean;
  searchQuery?: string;
}

// ファイルタイプに応じたアイコンを取得
const getFileIcon = (mimeType: string) => {
  if (mimeType.includes('pdf')) {
    return <DescriptionIcon sx={{ fontSize: 20, color: '#6a7282' }} />;
  }
  if (mimeType.includes('sheet') || mimeType.includes('spreadsheet')) {
    return <DataObjectIcon sx={{ fontSize: 20, color: '#6a7282' }} />;
  }
  if (mimeType.includes('word') || mimeType.includes('document')) {
    return <FilePresentIcon sx={{ fontSize: 20, color: '#6a7282' }} />;
  }
  return <DescriptionIcon sx={{ fontSize: 20, color: '#6a7282' }} />;
};

/**
 * ファイル一覧の行コンポーネント
 * @param file - ファイル情報
 * @param isLast - 最後の行かどうか
 * @param searchQuery - 検索キーワード
 */
export const FileListItem = ({ file, isLast = false, searchQuery = '' }: FileListItemProps) => {
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const value = bytes / Math.pow(k, i);
    return `${value >= 100 ? value.toFixed(0) : value.toFixed(2)} ${sizes[i]}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ハイライト用のレンダリング関数
  const renderHighlight = (text: string, query: string) => {
    if (!query) return text;

    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);

    if (index === -1) return text;

    return (
      <>
        {text.substring(0, index)}
        <Box
          component="span"
          sx={{
            backgroundColor: '#fef9c3',
            color: '#854d0e',
            fontWeight: 600,
            padding: '0 2px',
          }}
        >
          {text.substring(index, index + query.length)}
        </Box>
        {text.substring(index + query.length)}
      </>
    );
  };

  return (
    <TableRow
      data-testid={`file-list-item-${file.id}`}
      sx={{
        borderBottom: isLast ? 'none' : '0.667px solid #e8eaed',
        '&:hover': {
          backgroundColor: '#fafafa',
        },
      }}
    >
      {/* チェックボックス */}
      <TableCell sx={{ width: '6%', p: 1 }}>
        <Checkbox
          size="small"
          sx={{
            color: '#0a0a0a',
            '&.Mui-checked': {
              color: '#0a0a0a',
            },
            '& .MuiSvgIcon-root': {
              stroke: '#d1d5dc',
              strokeWidth: '0.5',
            },
          }}
        />
      </TableCell>

      {/* ファイル名 */}
      <TableCell sx={{ width: '33%', p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getFileIcon(file.mimeType)}
          <Typography
            variant="body2"
            sx={{
              fontSize: '14px',
              color: '#101828',
              fontWeight: 400,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {renderHighlight(file.name, searchQuery)}
          </Typography>
        </Box>
      </TableCell>

      {/* タグ */}
      <TableCell sx={{ width: '18%', p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            gap: 0.67,
            flexWrap: 'wrap',
            alignContent: 'flex-start',
          }}
        >
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
      </TableCell>

      {/* アップロード日時 */}
      <TableCell sx={{ width: '18%', p: 2, overflow: 'hidden' }}>
        <Typography
          variant="body2"
          sx={{
            fontSize: '14px',
            color: '#6a7282',
            fontWeight: 400,
          }}
        >
          {formatDate(file.uploadedAt)}
        </Typography>
      </TableCell>

      {/* サイズ */}
      <TableCell sx={{ width: '12%', p: 2, overflow: 'hidden' }}>
        <Typography
          variant="body2"
          sx={{
            fontSize: '14px',
            color: '#6a7282',
            fontWeight: 400,
          }}
        >
          {formatSize(file.size)}
        </Typography>
      </TableCell>

      {/* アップロード者 */}
      <TableCell sx={{ width: '13%', p: 2, overflow: 'hidden' }}>
        <Typography
          variant="body2"
          sx={{
            fontSize: '14px',
            color: '#6a7282',
            fontWeight: 400,
          }}
        >
          管理者
        </Typography>
      </TableCell>
    </TableRow>
  );
};
