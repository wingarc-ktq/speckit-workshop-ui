import DateRangeIcon from '@mui/icons-material/DateRange';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { TagSelector } from '@/presentations/components/files';

interface FiltersPanelProps {
  selectedTags: string[];
  onToggleTag: (tagId: string) => void;
  startDate: string;
  endDate: string;
  onChangeStartDate: (value: string) => void;
  onChangeEndDate: (value: string) => void;
}

export const FiltersPanel: React.FC<FiltersPanelProps> = ({
  selectedTags,
  onToggleTag,
  startDate,
  endDate,
  onChangeStartDate,
  onChangeEndDate,
}) => {
  return (
    <Box sx={{ px: 3, py: 2, backgroundColor: '#f9fafb', display: 'flex', gap: 2 }}>
      <Paper
        sx={{
          flex: 1,
          p: 2,
          borderRadius: '10px',
          border: '0.667px solid #e5e7eb',
          backgroundColor: '#fff',
          boxShadow: '0px 1px 3px 0px rgba(0,0,0,0.1), 0px 1px 2px -1px rgba(0,0,0,0.1)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocalOfferIcon sx={{ fontSize: '20px', color: '#364153', mr: 0.5 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '14px', color: '#364153', m: 0 }}>
            タグ
          </Typography>
          <Button
            size="small"
            sx={{
              ml: 'auto',
              minWidth: 'auto',
              p: 0.5,
              backgroundColor: '#eff6ff',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              color: '#3b82f6',
              '&:hover': { backgroundColor: '#e0f2fe' },
            }}
          >
            +
          </Button>
        </Box>
        <TagSelector selectedTags={selectedTags} onToggleTag={onToggleTag} />
      </Paper>

      <Paper
        sx={{
          width: '320px',
          p: 2,
          borderRadius: '10px',
          border: '0.667px solid #e5e7eb',
          backgroundColor: '#fff',
          boxShadow: '0px 1px 3px 0px rgba(0,0,0,0.1), 0px 1px 2px -1px rgba(0,0,0,0.1)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <DateRangeIcon sx={{ fontSize: '20px', color: '#364153', mr: 0.5 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '14px', color: '#364153', m: 0 }}>
            アップロード日時
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Typography sx={{ fontSize: '12px', minWidth: '48px', color: '#4a5565', fontWeight: 400, m: 0 }}>
              開始日
            </Typography>
            <TextField
              type="date"
              size="small"
              value={startDate}
              onChange={(e) => onChangeStartDate(e.target.value)}
              variant="outlined"
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '4px',
                  backgroundColor: '#fff',
                },
              }}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Typography sx={{ fontSize: '12px', minWidth: '48px', color: '#4a5565', fontWeight: 400, m: 0 }}>
              終了日
            </Typography>
            <TextField
              type="date"
              size="small"
              value={endDate}
              onChange={(e) => onChangeEndDate(e.target.value)}
              variant="outlined"
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '4px',
                  backgroundColor: '#fff',
                },
              }}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};
