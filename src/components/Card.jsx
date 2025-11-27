// Card Component
// Reusable card container with optional title and action button

const Card = ({ title, action, children, className = '' }) => {
  return (
    <div className={`bg-white rounded-card shadow-card border border-gray-100 hover:shadow-card-hover transition-all duration-300 ${className}`}>
      {(title || action) && (
        <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
          {title && (
            <h2 className="text-xl font-semibold text-gray-900">
              {typeof title === 'string' ? title : title}
            </h2>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={title || action ? 'p-8' : 'p-8'}>
        {children}
      </div>
    </div>
  )
}

export default Card
