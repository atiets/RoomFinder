// src/components/forum/CreateThreadButton.jsx
import React from 'react';
import { 
  Fab, useMediaQuery, Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';

const CreateThreadButton = ({ onClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Tooltip title="Tạo bài viết mới">
      <Fab
        color="primary"
        aria-label="add"
        onClick={onClick}
        sx={{
          position: 'fixed',
          bottom: isMobile ? 16 : 24,
          right: isMobile ? 16 : 24,
          bgcolor: theme.palette.primary.main,
          '&:hover': {
            bgcolor: theme.palette.primary.dark,
          },
        }}
      >
        <AddIcon />
      </Fab>
    </Tooltip>
  );
};

export default CreateThreadButton;
