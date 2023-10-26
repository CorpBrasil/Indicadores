import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#313131',
      contrastText: '#fff'
    },
    secondary: {
      main: '#006633',
      contrastText: '#fff'
    },
    info: {
      main: '#111',
      contrastText: '#fff'
    },
    success: {
      main: '#05a937',
      contrastText: '#fff'
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

export const redTheme = createTheme({
  palette: {
    primary: {
      main: '#f44336',
      contrastText: '#fff'
    },
    secondary: {
      main: '#b71c1c',
      contrastText: '#fff'
    },
  }
})