import React, { useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { Tag, TagColor } from '@/domain/models/tag';
import { tKeys } from '@/i18n';
import { TagColorPicker } from '@/presentations/components/tags/TagColorPicker/TagColorPicker';
import { useCreateTag } from '@/presentations/hooks/queries/tags/useCreateTag';
import { useTags } from '@/presentations/hooks/queries/tags/useTags';
import { useUpdateTag } from '@/presentations/hooks/queries/tags/useUpdateTag';

export interface TagFormDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  tagId?: string | null;
  onClose: () => void;
}

interface TagFormData {
  name: string;
  color: TagColor;
}

export const TagFormDialog: React.FC<TagFormDialogProps> = ({
  open,
  mode,
  tagId,
  onClose,
}) => {
  const { t } = useTranslation();
  const { data: tags = [] } = useTags();
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();

  const existingTag = tagId
    ? tags.find((tag: Tag) => tag.id === tagId)
    : undefined;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TagFormData>({
    defaultValues: {
      name: '',
      color: 'blue' as TagColor,
    },
  });

  useEffect(() => {
    if (mode === 'edit' && existingTag) {
      reset({
        name: existingTag.name,
        color: existingTag.color,
      });
    } else if (mode === 'create') {
      reset({
        name: '',
        color: 'blue' as TagColor,
      });
    }
  }, [mode, existingTag, reset]);

  const onSubmit = async (data: TagFormData) => {
    try {
      if (mode === 'create') {
        await createTag.mutateAsync(data);
      } else if (mode === 'edit' && tagId) {
        await updateTag.mutateAsync({ tagId, request: data });
      }
      onClose();
    } catch (error) {
      // エラーハンドリングはuseMutationのonErrorで処理
      console.error('Tag operation failed:', error);
    }
  };

  const title =
    mode === 'create'
      ? t(tKeys.layouts.appSidebar.tags.formDialog.createTitle)
      : t(tKeys.layouts.appSidebar.tags.formDialog.editTitle);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      data-testid="tagFormDialog"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <Controller
              name="name"
              control={control}
              rules={{
                required: t(
                  tKeys.layouts.appSidebar.tags.formDialog.nameRequired
                ),
                maxLength: {
                  value: 50,
                  message: t(
                    tKeys.layouts.appSidebar.tags.formDialog.nameMaxLength
                  ),
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t(tKeys.layouts.appSidebar.tags.formDialog.nameLabel)}
                  error={Boolean(errors.name)}
                  helperText={errors.name?.message}
                  fullWidth
                  autoFocus
                  data-testid="tagNameInput"
                />
              )}
            />
            <Box>
              <Controller
                name="color"
                control={control}
                rules={{
                  required: t(
                    tKeys.layouts.appSidebar.tags.formDialog.colorRequired
                  ),
                }}
                render={({ field }) => (
                  <TagColorPicker
                    value={field.value}
                    onChange={field.onChange}
                    label={t(
                      tKeys.layouts.appSidebar.tags.formDialog.colorLabel
                    )}
                    data-testid="tagColorPicker"
                  />
                )}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onClose}
            disabled={isSubmitting}
            data-testid="cancelButton"
          >
            {t(tKeys.common.cancel)}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            data-testid="submitButton"
          >
            {mode === 'create'
              ? t(tKeys.layouts.appSidebar.tags.formDialog.createButton)
              : t(tKeys.layouts.appSidebar.tags.formDialog.saveButton)}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
