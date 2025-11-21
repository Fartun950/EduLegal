import { FileText, AlertCircle, MessageSquare, Bell, Users, RefreshCw, HelpCircle } from 'lucide-react'
import Button from './Button'

const EmptyState = ({ 
  icon: Icon = FileText, 
  title = 'No data available', 
  message = 'There is no data to display at this time.',
  actionLabel,
  onAction,
  retryLabel = 'Retry',
  onRetry,
  type = 'default'
}) => {
  const iconColors = {
    default: 'text-gray-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400',
  }

  const bgColors = {
    default: 'bg-gray-100',
    error: 'bg-red-100',
    warning: 'bg-yellow-100',
    info: 'bg-blue-100',
  }

  const iconColor = iconColors[type] || iconColors.default
  const bgColor = bgColors[type] || bgColors.default

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className={`w-16 h-16 ${bgColor} rounded-full flex items-center justify-center mb-4`}>
        <Icon className={iconColor} size={32} />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
        {title}
      </h3>
      
      <p className="text-sm text-gray-600 text-center max-w-md mb-6">
        {message}
      </p>

      <div className="flex gap-3 flex-wrap justify-center">
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
          >
            <RefreshCw size={16} className="inline mr-2" />
            {retryLabel}
          </Button>
        )}
        
        {onAction && actionLabel && (
          <Button
            variant="primary"
            size="sm"
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  )
}

// Predefined empty states for common scenarios
export const EmptyCases = ({ onRetry, onCreate }) => (
  <EmptyState
    icon={FileText}
    title="No cases found"
    message="There are no cases to display. Create a new case or check back later."
    actionLabel="Create Case"
    onAction={onCreate}
    onRetry={onRetry}
  />
)

export const EmptyForum = ({ onRetry, onCreate }) => (
  <EmptyState
    icon={MessageSquare}
    title="No discussions yet"
    message="Be the first to start a discussion or check back later for new posts."
    actionLabel="Start Discussion"
    onAction={onCreate}
    onRetry={onRetry}
  />
)

export const EmptyNotifications = ({ onRetry }) => (
  <EmptyState
    icon={Bell}
    title="No notifications"
    message="You're all caught up! There are no new notifications at this time."
    onRetry={onRetry}
  />
)

export const EmptyUsers = ({ onRetry }) => (
  <EmptyState
    icon={Users}
    title="No users found"
    message="There are no users to display at this time."
    onRetry={onRetry}
  />
)

export const ServiceUnavailable = ({ onRetry, service }) => (
  <EmptyState
    icon={AlertCircle}
    title="Service temporarily unavailable"
    message={`The ${service || 'service'} is currently unavailable. Please try again later or contact support if the problem persists.`}
    type="error"
    onRetry={onRetry}
    retryLabel="Retry Connection"
  />
)

export const NetworkError = ({ onRetry }) => (
  <EmptyState
    icon={AlertCircle}
    title="Connection error"
    message="Unable to connect to the server. Please check your internet connection and try again."
    type="error"
    onRetry={onRetry}
    retryLabel="Retry"
  />
)

export const LoadingError = ({ onRetry, message }) => (
  <EmptyState
    icon={HelpCircle}
    title="Failed to load data"
    message={message || "We couldn't load the data. Please try again or contact support if the problem continues."}
    type="warning"
    onRetry={onRetry}
    retryLabel="Try Again"
  />
)

export default EmptyState









