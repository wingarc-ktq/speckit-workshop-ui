import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import UploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';

interface SearchBarProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onOpenUpload: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder,
  value,
  onChange,
  onOpenUpload,
}) => {
  return (
    <Box
      sx={{
        position: 'relative',
        height: '41.333px',
        backgroundColor: '#f9fafb',
        p: '16px 24px',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <TextField
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        variant="outlined"
        size="small"
        fullWidth
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '656px',
          backgroundColor: '#fff',
          '& .MuiOutlinedInput-root': {
            borderRadius: '10px',
            border: '0.667px solid #d1d5dc',
            paddingLeft: '40px',
            height: '41.333px',
            '& fieldset': { border: 'none' },
            '&:hover': { borderColor: '#d1d5dc' },
          },
          '& .MuiInputBase-input': {
            fontSize: '16px',
            color: '#0a0a0a',
            fontFamily: "'Arimo', 'Noto Sans JP', sans-serif",
            padding: 0,
            '&::placeholder': { color: '#99a1af', opacity: 1 },
          },
        }}
        InputProps={{
          startAdornment: (
            <SearchIcon
              sx={{
                position: 'absolute',
                left: '12px',
                fontSize: '20px',
                color: '#99a1af',
              }}
            />
          ),
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          right: '24px',
          top: '2.67px',
          display: 'flex',
          gap: '8px',
        }}
      >
        <IconButton
          size="small"
          sx={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            p: '8px',
            backgroundColor: 'transparent',
            color: '#0a0a0a',
            '&:hover': { backgroundColor: '#f0f0f0' },
          }}
          title="展開"
        >
          <ExpandMoreIcon sx={{ fontSize: '20px' }} />
        </IconButton>

        <IconButton
          size="small"
          onClick={onOpenUpload}
          sx={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            p: '8px',
            backgroundColor: 'transparent',
            color: '#0a0a0a',
            '&:hover': { backgroundColor: '#f0f0f0' },
          }}
          title="アップロード"
        >
          <UploadIcon sx={{ fontSize: '20px' }} />
        </IconButton>

        <IconButton
          size="small"
          sx={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            p: '8px',
            backgroundColor: 'transparent',
            color: '#0a0a0a',
            '&:hover': { backgroundColor: '#f0f0f0' },
          }}
          title="削除"
        >
          <DeleteIcon sx={{ fontSize: '20px' }} />
        </IconButton>

        <IconButton
          size="small"
          sx={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            p: '8px',
            backgroundColor: 'transparent',
            color: '#0a0a0a',
            '&:hover': { backgroundColor: '#f0f0f0' },
          }}
          title="設定"
        >
          <SettingsIcon sx={{ fontSize: '20px' }} />
        </IconButton>
      </Box>
    </Box>
  );
};
