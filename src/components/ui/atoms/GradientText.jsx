import { Typography } from '@mui/material';

export default function GradientText({ children, variant = 'h5', gradient = 'primaryText', sx = {}, ...props }) {
  return (
    <Typography
      variant={variant}
      sx={{
        background: (theme) => theme.palette.gradients[gradient] || gradient,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        display: 'inline-block',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Typography>
  );
}
