import React from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContentText from '@mui/material/DialogContentText';
import { useTranslation } from 'react-i18next';

import type { ApplicationException } from '@/domain/errors';
import { tKeys } from '@/i18n';
import { useErrorMessage } from '@/presentations/hooks';

import * as S from './styled';

interface AppErrorDialogProps {
  title?: string;
  error?: ApplicationException | null;
  children?: React.ReactNode;
  onClose: () => void;
}

/**
 * 汎用アプリケーションエラーダイアログ
 */
export const AppErrorDialog: React.FC<AppErrorDialogProps> = ({
  title,
  error,
  children,
  onClose,
}) => {
  const { t } = useTranslation();
  const { toMessageFromError } = useErrorMessage();

  if (!error) return null;

  return (
    <Dialog
      data-testid="appErrorDialog"
      open
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <S.DialogTitle>
        <Alert variant="filled" severity="error" data-testid="errorAlert">
          {title ? title : t(tKeys.errors.title.error)}
        </Alert>
      </S.DialogTitle>
      <S.DialogContent>
        <DialogContentText data-testid="errorMessage" component={'div'}>
          {children ? nl2br(children) : nl2br(toMessageFromError(error))}
        </DialogContentText>
      </S.DialogContent>
      <S.DialogActions>
        <Button
          variant="outlined"
          color="primary"
          onClick={onClose}
          data-testid="okButton"
        >
          {t(tKeys.actions.ok)}
        </Button>
      </S.DialogActions>
    </Dialog>
  );
};

/**
 * 改行コードを<br />に置き換える
 * @param children
 * @returns 置き換えたJSX
 */
const nl2br = (children: React.ReactNode) => {
  if (typeof children === 'string') {
    return children.split(/(\r\n|\r|\n)/g).map((l, i) => {
      if (l.match(/(\r\n|\r|\n)/g)) {
        return <br key={i} />;
      }

      return <span key={i}>{l}</span>;
    });
  }
  return children;
};
