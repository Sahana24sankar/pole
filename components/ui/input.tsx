import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  variant?: 'default' | 'error' | 'success'
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, icon, variant = 'default', ...props }, ref) => {
    const getInputClasses = () => {
      const baseClasses = 'w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0'
      
      if (error) {
        return `${baseClasses} border-red-300 focus:border-red-500 focus:ring-red-500 ${className}`
      }
      if (variant === 'success') {
        return `${baseClasses} border-green-300 focus:border-green-500 focus:ring-green-500 ${className}`
      }
      return `${baseClasses} border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${className}`
    }

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="h-5 w-5 text-gray-400">
                {icon}
              </div>
            </div>
          )}
          <input
            className={`${getInputClasses()} ${icon ? 'pl-10' : ''}`}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="text-sm text-red-600 animate-fade-in">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input } 