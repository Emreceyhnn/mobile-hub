import { CardActionArea, Box, Avatar, Chip, Typography, alpha } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import GlassCard from '../atoms/GlassCard';
import GradientText from '../atoms/GradientText';

export default function AppLaunchCard({ 
  title, 
  description, 
  icon: Icon, 
  gradient,
  baseColor,
  isAvailable = true,
  onClick,
  statusLabel = 'Aktif'
}) {
  return (
    <GlassCard 
      sx={{ 
        background: isAvailable ? (theme) => theme.palette.gradients[gradient] : (theme) => alpha(theme.palette.background.glassDisabled, 0.5),
        borderColor: isAvailable ? `${baseColor}.main` : 'text.disabled',
        opacity: isAvailable ? 1 : 0.6,
        filter: isAvailable ? 'none' : 'grayscale(0.5)',
        transition: (theme) => `all ${theme.transitions.duration.shorter}ms ${theme.transitions.easing.easeInOut}`,
        '&:hover': {
          borderColor: isAvailable ? `${baseColor}.light` : 'text.disabled',
          transform: isAvailable ? 'translateY(-2px)' : 'none',
          boxShadow: isAvailable ? (theme) => `0 12px 48px ${alpha(theme.palette[baseColor].main, 0.25)}` : 'none',
        },
        '&.Mui-disabled': {
          opacity: 0.4,
          pointerEvents: 'none'
        }
      }}
    >
      <CardActionArea 
        onClick={onClick} 
        disabled={!isAvailable && onClick === undefined}
        sx={{ 
          p: 3,
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar 
            sx={{ 
              width: 64, 
              height: 64, 
              bgcolor: isAvailable ? `${baseColor}.main` : 'text.disabled',
              opacity: isAvailable ? 0.15 : 0.05,
              position: 'absolute'
            }} 
          />
          <Avatar 
            sx={{ 
              width: 64, 
              height: 64, 
              bgcolor: 'transparent', 
              color: isAvailable ? `${baseColor}.main` : 'text.disabled' 
            }}
          >
            <Icon fontSize="large" />
          </Avatar>
          
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
              {isAvailable ? (
                <GradientText variant="h5" fontWeight="900" gradient={`${baseColor}Text`}>
                  {title}
                </GradientText>
              ) : (
                <Typography variant="h5" fontWeight="900" color="text.secondary">
                  {title}
                </Typography>
              )}
              
              <Chip 
                label={statusLabel} 
                size="small" 
                variant={isAvailable ? "filled" : "outlined"}
                sx={isAvailable ? { 
                  bgcolor: (theme) => alpha(theme.palette[baseColor].main, 0.15),
                  color: `${baseColor}.main`, 
                  fontWeight: 'bold' 
                } : {
                  color: 'text.secondary',
                  borderColor: 'text.disabled'
                }} 
              />
            </Box>
            <Typography 
              variant="body2" 
              color={isAvailable ? "text.secondary" : "text.disabled"} 
              fontWeight="500"
            >
              {description}
            </Typography>
          </Box>
          
          {isAvailable ? (
            <ArrowForwardIosIcon color={baseColor} />
          ) : (
            <LockIcon color="action" />
          )}
        </Box>
      </CardActionArea>
    </GlassCard>
  );
}
