import React, { useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useTranslation } from 'react-i18next';

import { tKeys } from '@/i18n';
import { TagChips } from '@/presentations/components/tags/TagChips/TagChips';
import { useTags } from '@/presentations/hooks/queries/tags/useTags';

import { TagDeleteConfirmDialog } from './components/TagDeleteConfirmDialog/TagDeleteConfirmDialog';
import { TagFormDialog } from './components/TagFormDialog/TagFormDialog';

export interface TagManagementDialogProps {
  open: boolean;
  onClose: () => void;
}

export const TagManagementDialog: React.FC<TagManagementDialogProps> = ({
  open,
  onClose,
}) => {
  const { t } = useTranslation();
  const { data: tags = [] } = useTags();
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [deleteTagId, setDeleteTagId] = useState<string | null>(null);

  const handleCreateClick = () => {
    setFormMode('create');
    setSelectedTagId(null);
  };

  const handleEditClick = (tagId: string) => {
    setFormMode('edit');
    setSelectedTagId(tagId);
  };

  const handleDeleteClick = (tagId: string) => {
    setDeleteTagId(tagId);
  };

  const handleFormClose = () => {
    setFormMode(null);
    setSelectedTagId(null);
  };

  const handleDeleteDialogClose = () => {
    setDeleteTagId(null);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        data-testid="tagManagementDialog"
      >
        <DialogTitle>
          {t(tKeys.layouts.appSidebar.tags.manageDialog.title)}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleCreateClick}
              fullWidth
              data-testid="createTagButton"
            >
              {t(tKeys.layouts.appSidebar.tags.manageDialog.createButton)}
            </Button>
          </Box>
          <List>
            {tags.map((tag) => (
              <ListItem
                key={tag.id}
                secondaryAction={
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => handleEditClick(tag.id)}
                      data-testid={`editTagButton-${tag.id}`}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => handleDeleteClick(tag.id)}
                      data-testid={`deleteTagButton-${tag.id}`}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={
                    <TagChips
                      tags={[tag]}
                      size="medium"
                      data-testid={`tagChip-${tag.id}`}
                    />
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} data-testid="closeButton">
            {t(tKeys.common.close)}
          </Button>
        </DialogActions>
      </Dialog>

      {formMode && (
        <TagFormDialog
          open={Boolean(formMode)}
          mode={formMode}
          tagId={selectedTagId}
          onClose={handleFormClose}
        />
      )}

      {deleteTagId && (
        <TagDeleteConfirmDialog
          open={Boolean(deleteTagId)}
          tagId={deleteTagId}
          tagName={tags.find((tag) => tag.id === deleteTagId)?.name}
          onClose={handleDeleteDialogClose}
        />
      )}
    </>
  );
};
