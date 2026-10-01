import { HTMLAttributes } from 'react';

type Props = HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean;
  padded?: boolean;
};

export default function Card({ className = '', interactive = false, padded = true, ...props }: Props) {
  return (
    <div
      className={`ui-card ${padded ? 'p-5' : ''} ${interactive ? 'ui-card-interactive' : ''} ${className}`}
      {...props}
    />
  );
}
