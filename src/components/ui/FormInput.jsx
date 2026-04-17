import { forwardRef } from 'react'

const FormInput = forwardRef(({ label, id, error, hint, leftIcon, rightElement, className = '', ...props }, ref) => (
  <div className="space-y-1.5">
    {label && (
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700">
        {label}{props.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
    )}
    <div className="relative">
      {leftIcon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          {leftIcon}
        </div>
      )}
      <input
        ref={ref} id={id}
        className={`input-base ${leftIcon ? 'pl-10' : ''} ${rightElement ? 'pr-12' : ''} ${error ? 'input-error' : ''} ${className}`}
        {...props}
      />
      {rightElement && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightElement}</div>
      )}
    </div>
    {error && <p className="text-xs text-red-600 font-semibold flex items-center gap-1">⚠ {error}</p>}
    {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
  </div>
))
FormInput.displayName = 'FormInput'
export default FormInput