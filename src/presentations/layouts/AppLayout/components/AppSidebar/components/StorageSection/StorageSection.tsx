import React from 'react';

import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import { tKeys } from '@/i18n';

import * as S from './styled';

export const StorageSection: React.FC = () => {
  const { t } = useTranslation();
  const storageUsed = 0.02;
  const storageTotal = 15;
  const storagePercent = (storageUsed / storageTotal) * 100;

  return (
    <S.StorageSectionContainer data-testid="storageSection">
      <S.StorageCard>
        <S.StorageHeader>
          <Typography variant="body2">
            {t(tKeys.layouts.appSidebar.storage.title)}
          </Typography>
          <Button variant="text" color="primary" size="small">
            {t(tKeys.layouts.appSidebar.storage.upgrade)}
          </Button>
        </S.StorageHeader>
        <Typography variant="caption">
          {t(tKeys.layouts.appSidebar.storage.usage, {
            used: storageUsed.toFixed(1),
            total: storageTotal,
          })}
        </Typography>
        <LinearProgress variant="determinate" value={storagePercent} />
      </S.StorageCard>
    </S.StorageSectionContainer>
  );
};
