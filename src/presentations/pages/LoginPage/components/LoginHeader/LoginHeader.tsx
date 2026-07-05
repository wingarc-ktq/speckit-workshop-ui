import React from 'react';

import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import { tKeys } from '@/i18n';
import { Logo } from '@/presentations/ui';

import * as S from './styled';

/**
 * ログインページのヘッダー部分（ロゴ、タイトル、サブタイトル）
 */
export const LoginHeader: React.FC = () => {
  const { t } = useTranslation();

  return (
    <S.LoginHeader>
      <Logo size={48} sx={{ mb: 2 }} />
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ fontWeight: 'bold' }}
      >
        {t(tKeys.loginPage.title)}
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ textAlign: 'center' }}
      >
        {t(tKeys.loginPage.subtitle)}
      </Typography>
    </S.LoginHeader>
  );
};
