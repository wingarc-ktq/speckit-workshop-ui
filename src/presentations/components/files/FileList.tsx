import {
  Box,
  Checkbox,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';//バレルインポート。良くないとする。
import { useTranslation } from 'react-i18next';

import type { FileInfo } from '@/adapters/generated/files';

import { FileListItem } from './FileListItem';

interface FileListProps {
  files: FileInfo[];
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  isSearching?: boolean;
  searchQuery?: string;
}

/**
 * ファイル一覧を表示するコンポーネント
 * @param files - ファイルデータ配列
 * @param isLoading - ローディング中かどうか
 * @param isError - エラー発生中かどうか
 * @param error - エラーオブジェクト
 * @param isSearching - 検索中かどうか
 * @param searchQuery - 検索キーワード
 */
export const FileList = ({
  files,
  isLoading = false,
  isError = false,
  error = null,
  isSearching = false,
  searchQuery = '',
}: FileListProps) => {
  const { t } = useTranslation();

  // ローディング状態
  if (isLoading) {
    return (
      <TableContainer sx={{ border: '0.667px solid #e8eaed', borderRadius: '10px', overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f0f1f3', borderBottom: '0.667px solid #e8eaed' }}>
              <TableCell sx={{ width: '6%', p: 1 }}>
                <Checkbox
                  size="small"
                  disabled
                  sx={{
                    '& .MuiSvgIcon-root': {
                      borderColor: '#d1d5dc',
                    },
                  }}
                />
              </TableCell>
              <TableCell sx={{ width: '33%', p: 2 }}>
                <Typography variant="caption" sx={{ fontSize: '12px', fontWeight: 600, color: '#6a7282', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  {t('fileList.headers.name')}
                </Typography>
              </TableCell>
              <TableCell sx={{ width: '18%', p: 2 }}>
                <Typography variant="caption" sx={{ fontSize: '12px', fontWeight: 600, color: '#6a7282', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  {t('fileList.headers.tags')}
                </Typography>
              </TableCell>
              <TableCell sx={{ width: '18%', p: 2 }}>
                <Typography variant="caption" sx={{ fontSize: '12px', fontWeight: 600, color: '#6a7282', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  {t('fileList.headers.uploadedAt')}
                </Typography>
              </TableCell>
              <TableCell sx={{ width: '12%', p: 2 }}>
                <Typography variant="caption" sx={{ fontSize: '12px', fontWeight: 600, color: '#6a7282', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  {t('fileList.headers.size')}
                </Typography>
              </TableCell>
              <TableCell sx={{ width: '13%', p: 2 }}>
                <Typography variant="caption" sx={{ fontSize: '12px', fontWeight: 600, color: '#6a7282', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  {t('fileList.headers.uploader')}
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index} sx={{ borderBottom: '0.667px solid #e8eaed' }}>
                <TableCell sx={{ p: 1 }}>
                  <Skeleton variant="circular" width={16} height={16} />
                </TableCell>
                <TableCell sx={{ p: 2 }}>
                  <Skeleton width="80%" />
                </TableCell>
                <TableCell sx={{ p: 2 }}>
                  <Skeleton width="60%" />
                </TableCell>
                <TableCell sx={{ p: 2 }}>
                  <Skeleton width="70%" />
                </TableCell>
                <TableCell sx={{ p: 2 }}>
                  <Skeleton width="50%" />
                </TableCell>
                <TableCell sx={{ p: 2 }}>
                  <Skeleton width="60%" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  // エラー状態
  if (isError) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px',
          gap: 2,
        }}
      >
        <Typography variant="h6" color="error">
          {t('fileList.error.title')}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {error?.message || t('fileList.error.message')}
        </Typography>
      </Box>
    );
  }

  // 空状態
  if (files.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          gap: 2,
          textAlign: 'center',
        }}
      >
        {/* 検索アイコン */}
        <Box
          sx={{
            width: '120px',
            height: '120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            backgroundColor: '#f3f4f6',
          }}
        >
          <Box
            component="svg"
            sx={{
              width: '64px',
              height: '64px',
              color: '#9ca3af',
            }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </Box>
        </Box>

        <Box>
          <Typography 
            variant="h6" 
            sx={{ 
              fontSize: '20px',
              fontWeight: 600,
              color: '#111827',
              mb: 1,
            }}
          >
            {isSearching ? t('fileList.search.noResults') : t('fileList.empty.title')}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{
              fontSize: '14px',
              color: '#6b7280',
            }}
          >
            {isSearching ? t('fileList.search.noResultsMessage') : t('fileList.empty.message')}
          </Typography>
        </Box>
      </Box>
    );
  }

  // ファイル一覧表示
  return (
    <TableContainer sx={{
      border: 'none',
      borderRadius: '10px',
      overflow: 'hidden',
      '& .MuiTable-root': {
        borderCollapse: 'collapse',
      },
    }}>
      <Table sx={{
        border: '0.667px solid #e8eaed',
      }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f0f1f3', borderBottom: '0.667px solid #e8eaed' }}>
            <TableCell sx={{ width: '6%', p: 1 }} />
            <TableCell sx={{ width: '33%', p: 2 }}>
              <Typography variant="caption" sx={{ fontSize: '12px', fontWeight: 600, color: '#6a7282', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                {t('fileList.headers.name')}
              </Typography>
            </TableCell>
            <TableCell sx={{ width: '18%', p: 2 }}>
              <Typography variant="caption" sx={{ fontSize: '12px', fontWeight: 600, color: '#6a7282', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                {t('fileList.headers.tags')}
              </Typography>
            </TableCell>
            <TableCell sx={{ width: '18%', p: 2 }}>
              <Typography variant="caption" sx={{ fontSize: '12px', fontWeight: 600, color: '#6a7282', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                {t('fileList.headers.uploadedAt')}
              </Typography>
            </TableCell>
            <TableCell sx={{ width: '12%', p: 2 }}>
              <Typography variant="caption" sx={{ fontSize: '12px', fontWeight: 600, color: '#6a7282', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                {t('fileList.headers.size')}
              </Typography>
            </TableCell>
            <TableCell sx={{ width: '13%', p: 2 }}>
              <Typography variant="caption" sx={{ fontSize: '12px', fontWeight: 600, color: '#6a7282', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                {t('fileList.headers.uploader')}
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {files.map((file, index) => (
            <FileListItem 
              key={file.id} 
              file={file} 
              isLast={index === files.length - 1}
              searchQuery={searchQuery}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
