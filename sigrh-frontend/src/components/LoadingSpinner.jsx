export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-7 w-7',
    lg: 'h-10 w-10',
  }

  return (
    <div
      className={`${sizes[size]} animate-spin rounded-full border-2 border-current border-t-transparent opacity-40 ${className}`}
    />
  )
}
