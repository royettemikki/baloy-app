import { InputHTMLAttributes, forwardRef } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & { label?: string };

const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, className = '', id, ...props }, ref) => (
    <div>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-[11px] text-ink-soft">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={`w-full ui-input px-3.5 py-2.5 text-sm ${className} text-ink`}
        {...props}
      />
    </div>
  ),
);

Input.displayName = 'Input';
export default Input;
