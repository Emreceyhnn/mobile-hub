export default function LoadingSpinner({ size = 'md', text }) {
  return (
    <div className="flex flex-col items-center justify-center gap-12" style={{ padding: '32px' }}>
      <div className={`spinner${size === 'lg' ? ' spinner-lg' : ''}`} />
      {text && <p className="text-sm text-muted">{text}</p>}
    </div>
  )
}
