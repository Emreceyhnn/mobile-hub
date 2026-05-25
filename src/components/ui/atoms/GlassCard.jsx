import { Card } from '@mui/material';

export default function GlassCard({ children, sx = {}, ...props }) {
  return (
    <Card
      sx={{
        // All glassmorphism logic is centralized in theme.js MuiCard overrides.
        // We just pass any additional sx overrides here.
        ...sx,
      }}
      {...props}
    >
      {children}
    </Card>
  );
}
