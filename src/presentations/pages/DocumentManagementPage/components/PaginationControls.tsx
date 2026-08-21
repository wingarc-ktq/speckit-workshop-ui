import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

interface PaginationControlsProps {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  onChangePage: (page: number) => void;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({ 
  currentPage, 
  totalCount,
  pageSize,
  onChangePage 
}) => {
  const totalPages = Math.ceil(totalCount / pageSize);
  
  if (totalPages <= 1) {
    return null; // 1ページ以下ならページネーション非表示
  }

  // 表示するページ番号を計算（最大5ページまで表示）
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      // 全ページを表示
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 現在のページを中心に表示
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisible - 1);
      
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();
  return (
    <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', gap: 0.5, alignItems: 'center' }}>
      <Button
        size="small"
        disabled={currentPage === 1}
        onClick={() => onChangePage(Math.max(1, currentPage - 1))}
        sx={{
          opacity: currentPage === 1 ? 0.5 : 1,
          color: '#0a0a0a',
          textTransform: 'none',
          fontSize: '14px',
          width: '97.917px',
          height: '36px',
          fontFamily: "'Arimo', sans-serif",
          fontWeight: 400,
          backgroundColor: 'transparent',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
        }}
      >
        ← Previous
      </Button>
      {pageNumbers.map((pageNum) => (
        <Button
          key={pageNum}
          variant={currentPage === pageNum ? 'contained' : 'outlined'}
          size="small"
          onClick={() => onChangePage(pageNum)}
          sx={{
            width: '36px',
            height: '36px',
            minWidth: '36px',
            p: 0,
            backgroundColor: currentPage === pageNum ? '#0a0a0a' : '#fff',
            borderColor: 'rgba(0,0,0,0.1)',
            color: currentPage === pageNum ? '#fff' : '#0a0a0a',
            fontSize: '14px',
            fontFamily: "'Arimo', sans-serif",
            fontWeight: 400,
            borderRadius: '8px',
            '&:hover': {
              backgroundColor: currentPage === pageNum ? '#333' : '#f0f0f0',
            },
          }}
        >
          {pageNum}
        </Button>
      ))}
      <Button
        size="small"
        disabled={currentPage === totalPages}
        onClick={() => onChangePage(Math.min(totalPages, currentPage + 1))}
        sx={{
          opacity: currentPage === totalPages ? 0.5 : 1,
          textTransform: 'none',
          color: '#0a0a0a',
          fontSize: '14px',
          width: '74.25px',
          height: '36px',
          fontFamily: "'Arimo', sans-serif",
          fontWeight: 400,
          backgroundColor: 'transparent',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
        }}
      >
        Next →
      </Button>
    </Box>
  );
};
