import { forwardRef, useEffect, type InputHTMLAttributes } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ id, label, error, icon, className = '', required, ...rest }, ref) => {
    const controls = useAnimation();

    useEffect(() => {
      if (error) {
        controls.start({
          x: [0, -10, 10, -10, 10, 0],
          transition: { duration: 0.4, ease: 'easeInOut' },
        });
      }
    }, [error, controls]);

    return (
      <motion.div animate={controls} className="w-full">
        {label && (
          <label htmlFor={id} className="mb-1.5 block text-sm font-bold text-ink-muted ml-2">
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            required={required}
            aria-invalid={error ? true : undefined}
            className={[
              'block w-full rounded-full border-0 bg-gray-100 px-5 py-3.5 text-sm font-semibold text-ink',
              'transition-shadow placeholder:text-gray-400 placeholder:font-medium',
              // UPDATED: Focus ring uses the new Lilac
              'focus:outline-none focus:ring-4 focus:ring-pastel-lilac focus:bg-white', 
              icon ? 'pl-12' : 'pl-5',
              error ? 'ring-4 ring-red-200 bg-red-50' : '',
              className,
            ].join(' ')}
            {...rest}
          />
        </div>
        {error && <p className="mt-1.5 ml-2 text-xs font-bold text-red-500">{error}</p>}
      </motion.div>
    );
  },
);
AuthInput.displayName = 'AuthInput';