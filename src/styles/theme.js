import { createTheme } from '@mui/material/styles';

const baseTheme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 640, // Mobile-first boundaries
      md: 768,
      lg: 1024,
      xl: 1280,
    },
  },
  spacing: 8, // 1 unit = 8px
  palette: {
    mode: 'dark',
    primary: {
      main: '#8b5cf6', // accent-purple
      light: '#a78bfa',
      dark: '#7c3aed',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00d9a3', // accent-green
      light: '#34d399',
      dark: '#059669',
      contrastText: '#001A12',
    },
    background: {
      default: '#0A0C12', // Pure deep dark for background
      paper: '#161A27', // Card surface
      glass: 'rgba(22, 26, 39, 0.65)',
      glassHover: 'rgba(22, 26, 39, 0.85)',
      glassActive: 'rgba(255, 255, 255, 0.05)',
      glassDisabled: 'rgba(255, 255, 255, 0.02)',
      appBar: 'rgba(10, 12, 18, 0.65)',
    },
    text: {
      primary: '#F0F4FF',
      secondary: '#8892A4',
      disabled: '#525C70',
    },
    action: {
      active: 'rgba(255, 255, 255, 0.7)',
      hover: 'rgba(255, 255, 255, 0.08)',
      hoverOpacity: 0.08,
      selected: 'rgba(255, 255, 255, 0.16)',
      selectedOpacity: 0.16,
      disabled: 'rgba(255, 255, 255, 0.3)',
      disabledBackground: 'rgba(255, 255, 255, 0.12)',
      disabledOpacity: 0.38,
      focus: 'rgba(255, 255, 255, 0.12)',
      focusOpacity: 0.12,
      activatedOpacity: 0.24,
    },
    error: { main: '#ef4444' },
    warning: { main: '#f59e0b' },
    info: { main: '#3b82f6' },
    success: { main: '#10b981' },
    divider: 'rgba(255,255,255,0.06)',
    // Custom Tokens
    glassBorder: 'rgba(255,255,255,0.05)',
    glassBorderHover: 'rgba(255,255,255,0.15)',
    gradients: {
      primary: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
      primaryHover: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
      secondary: 'linear-gradient(135deg, #00D9A3 0%, #059669 100%)',
      secondaryHover: 'linear-gradient(135deg, #34d399 0%, #00D9A3 100%)',
      primaryText: 'linear-gradient(135deg, #8B5CF6, #a78bfa)',
      secondaryText: 'linear-gradient(135deg, #00D9A3, #34d399)',
      mixedText: 'linear-gradient(135deg, #00D9A3 0%, #8B5CF6 100%)',
      cardOverlay: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0) 100%)',
      appNutrition: 'linear-gradient(145deg, rgba(0, 217, 163, 0.08) 0%, rgba(22, 26, 39, 0.6) 100%)',
      appFinance: 'linear-gradient(145deg, rgba(139, 92, 246, 0.08) 0%, rgba(22, 26, 39, 0.6) 100%)',
    },
  },
  typography: {
    fontFamily: '"Outfit", "Inter", sans-serif',
    h1: { fontWeight: 900, letterSpacing: '-0.02em' },
    h2: { fontWeight: 900, letterSpacing: '-0.02em' },
    h3: { fontWeight: 900, letterSpacing: '-0.02em' },
    h4: { fontWeight: 800, letterSpacing: '-0.02em' },
    h5: { fontWeight: 800, letterSpacing: '-0.01em' },
    h6: { fontWeight: 700, letterSpacing: '-0.01em' },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    body1: { fontWeight: 400, letterSpacing: '0.01em' },
    body2: { fontWeight: 400, letterSpacing: '0.01em' },
    button: { fontWeight: 700, textTransform: 'none' },
    overline: { letterSpacing: '0.1em', fontWeight: 700 }
  },
  shape: {
    borderRadius: 4, // 1 unit = 4px (default MUI behavior)
  },
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200, // Standardized micro-interaction time
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    }
  }
});

const muiTheme = createTheme(baseTheme, {
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: baseTheme.palette.background.default,
          backgroundImage: 'radial-gradient(circle at 50% -20%, rgba(139, 92, 246, 0.15), rgba(10, 12, 18, 1) 40%)',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: baseTheme.palette.background.glass,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          backgroundImage: baseTheme.palette.gradients.cardOverlay,
          border: `1px solid ${baseTheme.palette.glassBorder}`,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          transition: `all ${baseTheme.transitions.duration.shorter}ms ${baseTheme.transitions.easing.easeInOut}`,
          borderRadius: baseTheme.shape.borderRadius,
        },
      },
    },
    MuiCardActionArea: {
      styleOverrides: {
        root: {
          transition: `background-color ${baseTheme.transitions.duration.shorter}ms ${baseTheme.transitions.easing.easeInOut}`,
          '&:hover': {
            backgroundColor: baseTheme.palette.action.hover,
          },
          '&:active': {
            backgroundColor: baseTheme.palette.background.glassActive,
          },
          '&:focus-visible': {
            backgroundColor: baseTheme.palette.action.focus,
            outline: `2px solid ${baseTheme.palette.primary.main}`,
            outlineOffset: '2px',
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 9999, // Pill shape for all buttons
          padding: baseTheme.spacing(1.25, 3),
          boxShadow: 'none',
          textTransform: 'none',
          fontWeight: 700,
          transition: `all ${baseTheme.transitions.duration.shorter}ms ${baseTheme.transitions.easing.easeInOut}`,
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(1px)',
          },
          '&.Mui-disabled': {
            opacity: 0.5,
            pointerEvents: 'none',
            backgroundColor: baseTheme.palette.action.disabledBackground,
            color: baseTheme.palette.text.disabled,
          },
          '&.loading': {
            color: 'transparent',
            pointerEvents: 'none',
            '&::after': {
              content: '""',
              position: 'absolute',
              width: '16px',
              height: '16px',
              top: '0',
              left: '0',
              bottom: '0',
              right: '0',
              margin: 'auto',
              border: '2px solid transparent',
              borderTopColor: 'currentColor',
              borderRadius: '50%',
              animation: 'button-loading-spinner 1s ease infinite',
            }
          }
        },
        containedPrimary: {
          background: baseTheme.palette.gradients.primary,
          color: baseTheme.palette.primary.contrastText,
          '&:hover': {
            background: baseTheme.palette.gradients.primaryHover,
          }
        },
        containedSecondary: {
          background: baseTheme.palette.gradients.secondary,
          color: baseTheme.palette.secondary.contrastText,
          '&:hover': {
            background: baseTheme.palette.gradients.secondaryHover,
          }
        }
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: baseTheme.palette.background.paper,
        }
      }
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
        }
      }
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          color: baseTheme.palette.text.disabled,
          transition: `all ${baseTheme.transitions.duration.shorter}ms ${baseTheme.transitions.easing.easeInOut}`,
          '&.Mui-selected': {
            color: baseTheme.palette.secondary.main,
            transform: 'scale(1.05)',
          },
          '&:hover': {
            color: baseTheme.palette.text.secondary,
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
          '&:focus-visible': {
            outline: `2px solid ${baseTheme.palette.primary.main}`,
            outlineOffset: '2px',
            borderRadius: baseTheme.shape.borderRadius,
          }
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: 'rgba(17, 20, 32, 0.85)',
          backdropFilter: 'blur(24px)',
          border: `1px solid ${baseTheme.palette.glassBorder}`,
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          borderRadius: 24,
        }
      }
    }
  },
});

// Adding global keyframes for button loading state
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes button-loading-spinner {
      from { transform: rotate(0turn); }
      to { transform: rotate(1turn); }
    }
  `;
  document.head.appendChild(style);
}

export default muiTheme;
