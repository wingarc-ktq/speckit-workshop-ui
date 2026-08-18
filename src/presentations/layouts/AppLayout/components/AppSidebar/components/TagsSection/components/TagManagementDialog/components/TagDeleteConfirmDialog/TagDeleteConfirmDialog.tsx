import React from 'react';

import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useTranslation } from 'react-i18next';

import { tKeys } from '@/i18n';
import { useDeleteTag } from '@/presentations/hooks/queries/tags/useDeleteTag';

export interface TagDeleteConfirmDialogProps {
  open: boolean;
  tagId: string | null;
  tagName?: string;
  onClose: () => void;
}

export const TagDeleteConfirmDialog: React.FC<TagDeleteConfirmDialogProps> = ({
  open,
  tagId,
  tagName,
  onClose,
}) => {
  const { t } = useTranslation();
  const deleteTag = useDeleteTag();

  const handleDelete = async () => {
    if (!tagId) return;

    try {
      await deleteTag.mutateAsync(tagId);
      onClose();
    } catch (error) {
      // エラーハンドリングはuseMutationのonErrorで処理
      console.error('Tag deletion failed:', error);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      data-testid="tagDeleteConfirmDialog"
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarningAmberIcon color="warning" />
        {t(tKeys.layouts.appSidebar.tags.deleteDialog.title)}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t(tKeys.layouts.appSidebar.tags.deleteDialog.message, {
            tagName: tagName || '',
          })}
        </DialogContentText>
        <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
          <DialogContentText variant="body2">
            {t(tKeys.layouts.appSidebar.tags.deleteDialog.warning)}
          </DialogContentText>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} data-testid="cancelButton">
          {t(tKeys.common.cancel)}
        </Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          color="error"
          disabled={deleteTag.isPending}
          data-testid="confirmDeleteButton"
        >
          {t(tKeys.layouts.appSidebar.tags.deleteDialog.confirmButton)}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
