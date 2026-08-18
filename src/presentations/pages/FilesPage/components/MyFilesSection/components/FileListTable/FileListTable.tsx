import React, { useCallback } from 'react';

import DescriptionIcon from '@mui/icons-material/Description';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
  type GridRowId,
  type GridRowSelectionModel,
} from '@mui/x-data-grid';
import { format } from 'date-fns';

import type { DocumentFile } from '@/domain/models/file';
import { DataGridCellContent } from '@/presentations/components/dataGrid/DataGridCellContent';
import { TagChips } from '@/presentations/components/tags/TagChips/TagChips';
import { useTags } from '@/presentations/hooks/queries/tags/useTags';
import { formatFileSize } from '@/presentations/utils/fileFormatters';

interface FileListTableProps {
  files: DocumentFile[];
  total: number;
  paginationModel: GridPaginationModel;
  selectedFileIds?: string[];
  loading?: boolean;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  onSelectionChange?: (fileIds: string[]) => void;
  onRowClick?: (file: DocumentFile) => void;
}

export const FileListTable: React.FC<FileListTableProps> = ({
  files,
  total,
  paginationModel,
  selectedFileIds = [],
  loading = false,
  onPaginationModelChange,
  onSelectionChange,
  onRowClick,
}) => {
  const { data: tags } = useTags();

  // Convert string[] to GridRowSelectionModel
  const rowSelectionModel: GridRowSelectionModel = React.useMemo(
    () => ({
      type: 'include',
      ids: new Set<GridRowId>(selectedFileIds),
    }),
    [selectedFileIds]
  );

  const getFileTags = useCallback(
    (tagIds: string[]) => {
      if (!Array.isArray(tagIds)) return [];
      return tags.filter((tag) => tagIds.includes(tag.id));
    },
    [tags]
  );

  const columns: GridColDef<DocumentFile>[] = React.useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        flex: 1,
        minWidth: 300,
        renderCell: (params) => (
          <DataGridCellContent>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'info.main' }}>
              <DescriptionIcon sx={{ fontSize: 24 }} />
            </Avatar>
            <Typography variant="body2" noWrap>
              {params.value}
            </Typography>
          </DataGridCellContent>
        ),
      },
      {
        field: 'tagIds',
        headerName: 'Tags',
        flex: 1,
        minWidth: 200,
        sortable: false,
        align: 'center',
        renderCell: (params) => (
          <DataGridCellContent>
            <TagChips tags={getFileTags(params.value)} size="small" />
          </DataGridCellContent>
        ),
      },
      {
        field: 'uploadedAt',
        headerName: 'Last Modified',
        flex: 1,
        minWidth: 200,
        valueFormatter: (value) => format(value, 'yyyy/MM/dd HH:mm'),
      },
      {
        field: 'size',
        headerName: 'File Size',
        flex: 1,
        minWidth: 150,
        valueFormatter: (value) => formatFileSize(value),
      },
    ],
    [getFileTags]
  );

  const handleRowSelectionModelChange = useCallback(
    (newSelection: GridRowSelectionModel) => {
      // Convert GridRowSelectionModel to string[]
      const selectedIds = Array.from(newSelection.ids) as string[];
      onSelectionChange?.(selectedIds);
    },
    [onSelectionChange]
  );

  const handleRowClick = useCallback(
    (params: { row: DocumentFile }) => {
      onRowClick?.(params.row);
    },
    [onRowClick]
  );

  return (
    <DataGrid
      autoHeight
      rows={files}
      columns={columns}
      paginationMode="server"
      paginationModel={paginationModel}
      onPaginationModelChange={onPaginationModelChange}
      rowCount={total}
      rowSelectionModel={rowSelectionModel}
      onRowSelectionModelChange={handleRowSelectionModelChange}
      onRowClick={handleRowClick}
      loading={loading}
      checkboxSelection
      disableRowSelectionOnClick
      pageSizeOptions={[5, 10, 25]}
    />
  );
};
