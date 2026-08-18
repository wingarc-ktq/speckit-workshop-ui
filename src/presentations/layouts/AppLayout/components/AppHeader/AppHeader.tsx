import React, { useCallback, useEffect, useState } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { tKeys } from '@/i18n/tKeys';
import { useDebounce } from '@/presentations/hooks/useDebounce';
import { useFilesSearchParams } from '@/presentations/pages/FilesPage/hooks/useFilesSearchParams';
import { Logo } from '@/presentations/ui';

import { SearchFilterPopover, UserMenu } from './components';
import * as S from './styled';

interface AppHeaderProps {
  onMenuToggle: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onMenuToggle }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { searchQuery, setSearchQuery } = useFilesSearchParams();
  const [searchValue, setSearchValue] = useState(searchQuery ?? '');
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(
    null
  );

  // 300msデバウンス
  const debouncedSearch = useDebounce(searchValue, 300);

  // デバウンスされた検索値をURLパラメータに反映
  useEffect(() => {
    setSearchQuery(debouncedSearch);
  }, [debouncedSearch, setSearchQuery, location.pathname, navigate]);

  const handleSearchClear = useCallback(() => {
    setSearchValue('');
  }, []);

  const handleFilterOpen = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setFilterAnchorEl(event.currentTarget);
    },
    []
  );

  const handleFilterClose = useCallback(() => {
    setFilterAnchorEl(null);
  }, []);

  return (
    <S.HeaderAppBar
      enableColorOnDark
      position="fixed"
      elevation={0}
      color="inherit"
    >
      <S.StyledToolbar>
        <S.HeaderContent>
          <IconButton
            edge="start"
            data-testid="toggleButton"
            onClick={onMenuToggle}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo and App Name */}
          <S.LogoSection>
            <Logo size={32} />
            <Typography
              variant="h6"
              component="span"
              sx={{ fontWeight: 'bold', color: 'inherit' }}
            >
              UI Proto
            </Typography>
          </S.LogoSection>
        </S.HeaderContent>

        <S.SearchField
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={t(tKeys.layouts.appHeader.searchPlaceholder)}
          size="small"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {searchValue && (
                    <IconButton
                      size="small"
                      onClick={handleSearchClear}
                      edge="end"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  )}
                  <IconButton
                    size="small"
                    onClick={handleFilterOpen}
                    data-testid="filterButton"
                  >
                    <TuneIcon />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        <SearchFilterPopover
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={handleFilterClose}
        />

        <S.HeaderActions>
          <IconButton>
            <Badge badgeContent={3} color="error">
              <NotificationsOutlinedIcon />
            </Badge>
          </IconButton>
          <UserMenu />
        </S.HeaderActions>
      </S.StyledToolbar>
    </S.HeaderAppBar>
  );
};
