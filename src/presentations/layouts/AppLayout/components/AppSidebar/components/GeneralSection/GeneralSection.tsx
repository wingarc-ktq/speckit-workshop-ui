import React from 'react';

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import HistoryIcon from '@mui/icons-material/History';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import ShareIcon from '@mui/icons-material/Share';
import List from '@mui/material/List';
import { useTranslation } from 'react-i18next';

import { tKeys } from '@/i18n';

import { NavigationListItem } from '../shared';

import * as S from './styled';

export const GeneralSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <S.SectionContainer data-testid="generalSection">
      <S.SectionHeader>
        {t(tKeys.layouts.appSidebar.general.title)}
      </S.SectionHeader>
      <List dense>
        <NavigationListItem
          to="/"
          icon={<InsertDriveFileOutlinedIcon />}
          label={t(tKeys.layouts.appSidebar.general.myFiles)}
        />
        <NavigationListItem
          to="/recent"
          icon={<HistoryIcon />}
          label={t(tKeys.layouts.appSidebar.general.recent)}
        />
        <NavigationListItem
          to="/shared"
          icon={<ShareIcon />}
          label={t(tKeys.layouts.appSidebar.general.sharedWithMe)}
        />
        <NavigationListItem
          to="/deleted"
          icon={<DeleteOutlineIcon />}
          label={t(tKeys.layouts.appSidebar.general.deletedFiles)}
        />
      </List>
    </S.SectionContainer>
  );
};
