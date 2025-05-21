// src/theme/forumTheme.js
import { createTheme } from '@mui/material/styles';

const forumTheme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32', // Xanh lá đậm
      light: '#C1E1C1', // Xanh lá pastel
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ED6C02', // Cam đậm
      light: '#FFD8B1', // Cam pastel
      contrastText: '#ffffff',
    },
    background: {
      default: '#F5F7F9',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 20,
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
          borderRadius: 12,
        },
      },
    },
  },
});

export default forumTheme;
