import React, { useCallback } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from '@mui/material/Link';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  loginCredentialsSchema,
  type LoginCredentials,
} from '@/domain/models/auth';
import { tKeys } from '@/i18n';
import {
  AppErrorDialog,
  BooleanController,
  StringController,
} from '@/presentations/components';
import { useLoginMutation } from '@/presentations/hooks/queries';
import { FormButton, FormField } from '@/presentations/ui';

import { PasswordField } from './components';
import * as S from './styled';

/**
 * ログインフォーム
 */
export const LoginForm: React.FC = () => {
  const { t } = useTranslation();
  const { mutate, error, reset } = useLoginMutation();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginCredentialsSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const pathname = location.state?.from.pathname ?? '/';

  const login = useCallback(
    (credentials: LoginCredentials) => {
      // ログイン処理を実行
      mutate(credentials, {
        onSuccess: () => {
          // ログイン成功後、元のページまたはホームページにリダイレクト
          void navigate(pathname, {
            replace: true,
          });
        },
      });
    },
    [pathname, mutate, navigate]
  );

  return (
    <S.LoginFormContainer onSubmit={handleSubmit(login)}>
      <StringController
        name="email"
        control={control}
        render={(props) => (
          <FormField
            {...props}
            label={t(tKeys.loginPage.form.email)}
            size="medium"
          />
        )}
      />
      <StringController
        name="password"
        control={control}
        render={(props) => <PasswordField {...props} />}
      />
      <S.FormFooter>
        <S.RememberMeSection>
          <BooleanController
            name="rememberMe"
            control={control}
            render={(props) => (
              <FormControlLabel
                control={<Checkbox {...props} />}
                label={t(tKeys.loginPage.form.rememberMe)}
              />
            )}
          />
        </S.RememberMeSection>
        <FormButton type="submit" disabled={isSubmitting}>
          {t(tKeys.loginPage.form.loginButton)}
        </FormButton>
        <S.ForgotPasswordSection>
          <Link href="#" underline="hover" color="primary">
            {t(tKeys.loginPage.forgotPassword)}
          </Link>
        </S.ForgotPasswordSection>
      </S.FormFooter>
      <AppErrorDialog error={error} onClose={reset} />
    </S.LoginFormContainer>
  );
};
