// Button Component
// Reusable button component with multiple variants and sizes

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  onClick,
  disabled = false,
  className = '',
  ...props
}) => {
  // Variant styles with enhanced UI/UX
  const variantStyles = {
    primary: 'bg-primary-500 hover:bg-primary-600 text-white border-primary-500 hover:border-primary-600 shadow-md hover:shadow-lg',
    secondary: 'bg-secondary-500 hover:bg-secondary-600 text-white border-secondary-500 hover:border-secondary-600 shadow-md hover:shadow-lg',
    cta: 'bg-secondary-500 hover:bg-secondary-600 text-white border-secondary-500 hover:border-secondary-600 btn-cta', // Teal for high-priority CTAs
    outline: 'bg-transparent hover:bg-primary-50 text-primary-600 border-primary-300 hover:border-primary-400 hover:text-primary-700',
    danger: 'bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 shadow-md hover:shadow-lg',
    accent: 'bg-accent-500 hover:bg-accent-600 text-white border-accent-500 hover:border-accent-600 shadow-md hover:shadow-lg',
  }

  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  // Base styles with enhanced animations
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-button border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed btn-hover'

  // Combine all styles
  const buttonStyles = `
    ${baseStyles}
    ${variantStyles[variant] || variantStyles.primary}
    ${sizeStyles[size] || sizeStyles.md}
    ${className}
  `.trim().replace(/\s+/g, ' ')

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonStyles}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
