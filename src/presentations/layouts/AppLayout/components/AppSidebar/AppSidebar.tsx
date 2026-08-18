import React from 'react';

import Toolbar from '@mui/material/Toolbar';

import { GeneralSection, StorageSection, TagsSection } from './components';
import * as S from './styled';

export const AppSidebar: React.FC = () => {
  return (
    <S.SidebarDrawer
      data-testid="appSidebar"
      variant="persistent"
      anchor="left"
      open
    >
      <Toolbar />
      <S.SidebarContent>
        <GeneralSection />
        <TagsSection />
        <StorageSection />
      </S.SidebarContent>
    </S.SidebarDrawer>
  );
};
