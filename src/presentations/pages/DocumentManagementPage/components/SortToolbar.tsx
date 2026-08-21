import { useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';

import type { SortBy, SortOrder, ViewMode } from '@/presentations/hooks/useDocumentManagementState';

interface SortToolbarProps {
  sortBy: SortBy;
  sortOrder: SortOrder;
  viewMode: ViewMode;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onChangeSortBy: (sortBy: SortBy) => void;
  onToggleSortOrder: () => void;
  onChangeViewMode: (mode: ViewMode) => void;
}

export const SortToolbar: React.FC<SortToolbarProps> = ({
  sortBy,
  sortOrder,
  viewMode,
  currentPage,
  pageSize,
  totalCount,
  onChangeSortBy,
  onToggleSortOrder,
  onChangeViewMode,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const sortLabel =
    sortBy === 'uploadedAt' ? 'アップロード日時' : sortBy === 'name' ? 'ファイル名' : 'サイズ';

  // 表示範囲を計算
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalCount);
  const displayCount = totalCount > 0 ? `${startIndex}-${endIndex} / ${totalCount}` : '0';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 2,
        height: '36px',
      }}
    >
      <Typography variant="body2" sx={{ fontSize: '14px', color: '#4a5565', fontWeight: 400, m: 0 }}>
        {displayCount} 件の文書
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, ml: 'auto', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Typography sx={{ fontSize: '14px', color: '#4a5565', fontWeight: 400, m: 0 }}>
            並び替え:
          </Typography>
          <Button
            size="small"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            endIcon={<ExpandMoreIcon />}
            sx={{
              textTransform: 'none',
              borderColor: '#d1d5dc',
              color: '#0a0a0a',
              backgroundColor: '#f3f3f5',
              fontSize: '14px',
              fontWeight: 400,
              fontFamily: "'Arimo', 'Noto Sans JP', sans-serif",
              p: '6px 10px',
              minWidth: 'auto',
              '&:hover': { backgroundColor: '#e8e8ea', borderColor: '#d1d5dc' },
            }}
            variant="outlined"
          >
            {sortLabel}
          </Button>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem
              selected={sortBy === 'uploadedAt'}
              onClick={() => {
                onChangeSortBy('uploadedAt');
                setAnchorEl(null);
              }}
            >
              アップロード日時
            </MenuItem>
            <MenuItem
              selected={sortBy === 'name'}
              onClick={() => {
                onChangeSortBy('name');
                setAnchorEl(null);
              }}
            >
              ファイル名
            </MenuItem>
            <MenuItem
              selected={sortBy === 'size'}
              onClick={() => {
                onChangeSortBy('size');
                setAnchorEl(null);
              }}
            >
              サイズ
            </MenuItem>
          </Menu>
        </Box>
        <Button
          size="small"
          variant="outlined"
          onClick={onToggleSortOrder}
          sx={{
            textTransform: 'none',
            borderColor: '#d1d5dc',
            color: '#0a0a0a',
            backgroundColor: '#fff',
            fontSize: '14px',
            fontWeight: 400,
            fontFamily: "'Arimo', 'Noto Sans JP', sans-serif",
            p: '6px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            height: '36px',
            '&:hover': { backgroundColor: '#f0f0f0', borderColor: '#d1d5dc' },
          }}
          title="昇順/降順"
        >
          <SwapVertIcon sx={{ fontSize: '16px' }} />
          {sortOrder === 'asc' ? '昇順' : '降順'}
        </Button>
        <Divider orientation="vertical" sx={{ height: '24px', backgroundColor: '#d1d5dc' }} />
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton
            size="small"
            sx={{
              width: '36px',
              height: '32px',
              p: '0.667px',
              backgroundColor: viewMode === 'list' ? '#030213' : '#fff',
              color: viewMode === 'list' ? '#fff' : '#0a0a0a',
              borderRadius: '8px',
              border: viewMode === 'list' ? 'none' : '0.667px solid #d1d5dc',
              '&:hover': { backgroundColor: viewMode === 'list' ? '#030213' : '#f0f0f0' },
            }}
            onClick={() => onChangeViewMode('list')}
          >
            <ViewListIcon sx={{ fontSize: '16px' }} />
          </IconButton>
          <IconButton
            size="small"
            sx={{
              width: '36px',
              height: '32px',
              p: '0.667px',
              backgroundColor: viewMode === 'grid' ? '#fff' : 'transparent',
              color: '#0a0a0a',
              borderRadius: '8px',
              border: viewMode === 'grid' ? '0.667px solid #d1d5dc' : 'none',
              '&:hover': { backgroundColor: '#f0f0f0' },
            }}
            onClick={() => onChangeViewMode('grid')}
          >
            <ViewModuleIcon sx={{ fontSize: '16px' }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};
