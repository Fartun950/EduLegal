// Badge Component
// Reusable badge component for status indicators

const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'md',
  className = '' 
}) => {
  const variantStyles = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-secondary-100 text-secondary-800', // Teal
    success: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  }

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  }

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  )
}

export default Badge
