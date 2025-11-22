import { cn } from '@/lib/utils';

interface StatusPillProps {
  status: 'Draft' | 'Waiting' | 'Ready' | 'Done' | 'Canceled';
  className?: string;
}

export const StatusPill = ({ status, className }: StatusPillProps) => {
  return (
    <span
      className={cn(
        'status-pill',
        {
          'status-draft': status === 'Draft',
          'status-waiting': status === 'Waiting',
          'status-ready': status === 'Ready',
          'status-done': status === 'Done',
          'status-canceled': status === 'Canceled',
        },
        className
      )}
    >
      {status}
    </span>
  );
};
