// Card Component
// Reusable card container with optional title and action button

const Card = ({ title, action, children, className = '' }) => {
  return (
    <div className={`bg-white rounded-card shadow-soft border border-gray-200 card-hover ${className}`}>
      {(title || action) && (
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          {title && (
            <h2 className="text-lg font-semibold text-gray-900">
              {typeof title === 'string' ? title : title}
            </h2>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={title || action ? 'p-6' : 'p-6'}>
        {children}
      </div>
    </div>
  )
}

export default Card
