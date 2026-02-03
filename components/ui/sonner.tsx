'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        style: {
          background: '#000000',
          color: '#ffffff',
          border: '1px solid #333333',
        },
        classNames: {
          toast: 'group toast',
          description: 'text-gray-300',
          actionButton: 'bg-red-600 text-white',
          cancelButton: 'bg-gray-700 text-gray-300',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
