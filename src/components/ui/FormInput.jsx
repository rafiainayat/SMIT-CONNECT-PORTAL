/**
 * FormInput Component
 * 
 * REUSABLE form field with:
 * - Label
 * - Input/Textarea
 * - Error message
 * - Loading state
 */

export default function FormInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required,
  disabled,
  autoFocus,
  maxLength,
  rows, // For textarea
  className = '',
}) {
  const inputClasses = `
    w-full px-4 py-2.5 rounded-xl border border-gray-200 
    text-gray-900 placeholder-gray-400
    transition-all focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    ${error ? 'border-red-400 focus:ring-red-400' : ''}
    ${className}
  `

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows || 4}
          maxLength={maxLength}
          className={`${inputClasses} resize-none`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          maxLength={maxLength}
          className={inputClasses}
        />
      )}

      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {maxLength && (
        <p className="text-xs text-gray-400 text-right">{value?.length || 0}/{maxLength}</p>
      )}
    </div>
  )
}
