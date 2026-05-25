import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

export default function Modal({ isOpen, onClose, title, children }) {
  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
          m: 2
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {title}
        {onClose ? (
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        ) : null}
      </DialogTitle>
      <DialogContent dividers sx={{ p: 2 }}>
        {children}
      </DialogContent>
    </Dialog>
  )
}
