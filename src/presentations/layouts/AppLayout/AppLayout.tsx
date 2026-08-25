import React, { useRef } from 'react';

import { Outlet } from 'react-router-dom';

import { CommandPalette } from '@/presentations/components/CommandPalette';

import {
  AppBreadcrumbs,
  AppHeader,
  AppMain,
  AppSidebar,
  PageWrapper,
  ResizableLayout,
  type ResizableLayoutRef,
} from './components';
import * as S from './styled';

export const AppLayout: React.FC = () => {
  const resizableLayoutRef = useRef<ResizableLayoutRef>(null);

  const handleMenuToggle = () => {
    resizableLayoutRef.current?.toggleDrawer();
  };
  return (
    <S.LayoutRoot>
      <AppHeader onMenuToggle={handleMenuToggle} />
      <ResizableLayout ref={resizableLayoutRef} sidebarContent={<AppSidebar />}>
        <AppMain>
          <AppBreadcrumbs />
          <PageWrapper>
            <Outlet />
          </PageWrapper>
        </AppMain>
      </ResizableLayout>
      <CommandPalette />
    </S.LayoutRoot>
  );
};
