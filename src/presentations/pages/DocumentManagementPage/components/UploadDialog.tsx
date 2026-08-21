import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

import { useUploadFiles } from '@/presentations/hooks/mutations/useUploadFiles';
import { updateFile } from '@/adapters/generated/files';
import { getAllTags } from '@/domain/constants/tags';

const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'xlsx', 'jpg', 'png'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 20;

interface UploadDialogProps {
  open: boolean;
  onClose: () => void;
}

export const UploadDialog: React.FC<UploadDialogProps> = ({ open, onClose }) => {
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const queryClient = useQueryClient();
  const { mutateAsync: uploadFileMutate, isPending: isUploading } = useUploadFiles({
    onError: (error: Error) => {
      setUploadError(error.message || 'アップロードに失敗しました。');
    },
  });

  useEffect(() => {
    if (!open) {
      setUploadFiles([]);
      setUploadError(null);
      setSelectedTags([]);
    }
  }, [open]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setUploadError(null);

    if (uploadFiles.length + files.length > MAX_FILES) {
      setUploadError(`最大${MAX_FILES}ファイルまでアップロード可能です。`);
      return;
    }

    const validFiles: File[] = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        setUploadError(`${file.name}: ファイルサイズが大きすぎます。10MB以下のファイルをアップロードしてください。`);
        continue;
      }

      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!fileExtension || !ALLOWED_EXTENSIONS.includes(fileExtension)) {
        setUploadError(`${file.name}: 対応していない拡張子です。PDF、DOCX、XLSX、JPG、PNGのみアップロード可能です。`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setUploadFiles((prev) => [...prev, ...validFiles]);
    }

    event.target.value = '';
  };

  const handleRemoveFile = (index: number) => {
    setUploadFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const files = Array.from(event.dataTransfer.files);
    if (files.length === 0) return;

    setUploadError(null);

    if (uploadFiles.length + files.length > MAX_FILES) {
      setUploadError(`最大${MAX_FILES}ファイルまでアップロード可能です。`);
      return;
    }

    const validFiles: File[] = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        setUploadError(`${file.name}: ファイルサイズが大きすぎます。10MB以下のファイルをアップロードしてください。`);
        continue;
      }

      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!fileExtension || !ALLOWED_EXTENSIONS.includes(fileExtension)) {
        setUploadError(`${file.name}: 対応していない拡張子です。PDF、DOCX、XLSX、JPG、PNGのみアップロード可能です。`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setUploadFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleUpload = async () => {
    if (uploadFiles.length === 0) return;

    try {
      // 全ファイルを順次アップロード（タグ保存含む）
      for (const file of uploadFiles) {
        const res = await uploadFileMutate(file);
        
        // アップロード成功後、選択タグを保存（PUT /files/{id}）
        if (selectedTags.length > 0) {
          console.log('Updating file tags:', res.file.id, selectedTags);
          try {
            const updated = await updateFile(res.file.id, { tagIds: selectedTags });
            console.log('Tags updated successfully:', updated.file.tagIds);
          } catch (e) {
            console.error('タグ更新に失敗しました', e);
          }
        }
      }

      // タグ更新後にキャッシュを再度無効化してUIを更新
      await queryClient.invalidateQueries({ 
        predicate: (query) => {
          const queryKey = query.queryKey as unknown[];
          return Array.isArray(queryKey) && 
                 Array.isArray(queryKey[0]) && 
                 queryKey[0].includes('files') && 
                 queryKey[0].includes('list');
        }
      });

      // すべてのアップロードが成功したらダイアログを閉じる
      setUploadFiles([]);
      setUploadError(null);
      setSelectedTags([]);
      onClose();
    } catch (e) {
      console.error('アップロード失敗:', e);
      setUploadError('アップロードに失敗しました。');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { backgroundColor: '#ffffff', backgroundImage: 'none' } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid #e5e7eb' }}>
        <DialogTitle sx={{ p: 0, fontSize: 18, fontWeight: 600, color: '#0a0a0a' }}>文書をアップロード</DialogTitle>
        <IconButton onClick={onClose} sx={{ color: '#0a0a0a', fontSize: 24, fontWeight: 'bold' }}>
          ✕
        </IconButton>
      </Box>
      <DialogContent sx={{ pt: 3, pb: 3, backgroundColor: '#ffffff' }}>
        {uploadError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {uploadError}
          </Alert>
        )}

        <Box
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          sx={{
            display: 'block',
            border: isDragging ? '2px dashed #3b82f6' : '2px dashed #cbd5e1',
            borderRadius: '12px',
            p: 4,
            textAlign: 'center',
            backgroundColor: isDragging ? '#eff6ff' : '#f8fafc',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            mb: 3,
            outline: 'none',
            '&:hover': {
              borderColor: '#64748b',
              backgroundColor: '#f1f5f9',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            },
          }}
        >
          <Box component="label" sx={{ display: 'block', cursor: 'pointer' }}>
            <input type="file" onChange={handleFileSelect} style={{ display: 'none' }} accept=".pdf,.docx,.xlsx,.jpg,.png" multiple />
          <Box sx={{ fontSize: 48, mb: 1, color: '#94a3b8', fontWeight: 300 }}>↑</Box>
          <Typography sx={{ fontSize: 14, color: '#475569', mb: 0.5, fontWeight: 500 }}>
            {uploadFiles.length > 0 ? `${uploadFiles.length}個のファイルを選択` : 'ファイルをドラッグ&ドロップ、または'}
          </Typography>
          <Button
            variant="text"
            component="span"
            sx={{
              textTransform: 'none',
              color: '#0066cc',
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'underline',
              '&:hover': { backgroundColor: 'transparent', color: '#0052a3' },
            }}
          >
            ファイルを選択
          </Button>
          <Typography sx={{ fontSize: 12, color: '#64748b', mt: 1 }}>
            対応形式: PDF, Word, Excel, 画像 (最大10MB、最大20ファイル)
          </Typography>
          </Box>
        </Box>

        {uploadFiles.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 1.5, color: '#0a0a0a' }}>
              選択されたファイル ({uploadFiles.length})
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {uploadFiles.map((file, index) => (
                <Box
                  key={`${file.name}-${index}`}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {file.name}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: '#64748b', mt: 0.25 }}>
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, ml: 2, flexShrink: 0 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveFile(index)}
                      sx={{ color: '#ef4444', '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.1)' } }}
                    >
                      <Box sx={{ fontSize: 18 }}>✕</Box>
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* タグ選択（枠なし） */}
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocalOfferIcon sx={{ fontSize: '20px', color: '#364153', mr: 0.5 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '14px', color: '#364153', m: 0 }}>
              タグを選択
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {getAllTags().map((tag) => {
              const isSelected = selectedTags.includes(tag.id);
              return (
                <Box
                  key={tag.id}
                  onClick={() =>
                    setSelectedTags((prev) =>
                      prev.includes(tag.id)
                        ? prev.filter((id) => id !== tag.id)
                        : [...prev, tag.id]
                    )
                  }
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: '8px',
                    border: `0.667px solid ${tag.backgroundColor}`,
                    backgroundColor: isSelected ? tag.backgroundColor : '#fff',
                    color: isSelected ? tag.color : tag.backgroundColor,
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': { backgroundColor: tag.backgroundColor, color: tag.color },
                  }}
                >
                  {tag.name}
                </Box>
              );
            })}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1, justifyContent: 'flex-end', borderTop: '1px solid #e5e7eb', backgroundColor: '#ffffff' }}>
        <Button
          onClick={onClose}
          sx={{
            textTransform: 'none',
            color: '#0a0a0a',
            fontSize: 14,
            fontWeight: 500,
            borderRadius: '8px',
            px: 3,
            py: 1,
            backgroundColor: '#f5f5f5',
            '&:hover': { backgroundColor: '#e5e5e5' },
          }}
        >
          キャンセル
        </Button>
        <Button
          onClick={handleUpload}
          disabled={uploadFiles.length === 0 || isUploading}
          variant="contained"
          sx={{
            textTransform: 'none',
            backgroundColor: uploadFiles.length > 0 && !isUploading ? '#0a0a0a' : '#d1d5dc',
            color: uploadFiles.length > 0 && !isUploading ? '#fff' : '#6b7280',
            fontSize: 14,
            fontWeight: 500,
            borderRadius: '8px',
            px: 3,
            py: 1,
            cursor: uploadFiles.length > 0 && !isUploading ? 'pointer' : 'not-allowed',
            '&:hover': {
              backgroundColor: uploadFiles.length > 0 && !isUploading ? '#333' : '#d1d5dc',
            },
            '&:disabled': { backgroundColor: '#d1d5dc', color: '#6b7280' },
          }}
        >
          {isUploading ? 'アップロード中...' : 'アップロード'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
