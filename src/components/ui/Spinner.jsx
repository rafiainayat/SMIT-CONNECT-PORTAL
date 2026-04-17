export default function Spinner({ size = 'md', className = '' }) {
  const s = { sm: 'w-4 h-4 border-2', md: 'w-5 h-5 border-2', lg: 'w-9 h-9 border-[3px]' }
  return (
    <div className={`${s[size]} rounded-full border-gray-200 border-t-primary-600 animate-spin flex-shrink-0 ${className}`} />
  )
}