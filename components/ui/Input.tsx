import { InputHTMLAttributes, forwardRef } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & { label?: string };

const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, className = '', id, ...props }, ref) => (
    <div>
      {label && (
        <label htmlFor={id} className='block text-[11px] text-ink-soft mb-1.5'>
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={`w-full border border-line rounded-xl px-3.5 py-2.5 text-sm bg-surface ${className}`}
        {...props}
      />
    </div>
  ),
);

Input.displayName = 'Input';
export default Input;
