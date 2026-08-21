import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import type { AlertType } from './types';

export function AlertModal({
  open,
  title,
  message,
  type,
  onClose,
}: {
  open: boolean;
  title: string;
  message: string;
  type: AlertType;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className='fixed inset-0 bg-black/60 backdrop-blur-xs z-60 flex items-center justify-center p-4'>
      <div className='bg-card border border-border rounded-xl w-full max-w-sm p-6 shadow-2xl slide-in-from-bottom-2 animate-in fade-in duration-300'>
        <h3
          className={`text-lg font-bold mb-2 ${type === 'error' ? 'text-red-500' : 'text-green-500'}`}
        >
          {title}
        </h3>
        <p className='text-muted-foreground mb-6'>{message}</p>
        <div className='flex justify-end'>
          <Button onClick={onClose}>Okay</Button>
        </div>
      </div>
    </div>
  );
}

export function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className='fixed inset-0 bg-black/60 backdrop-blur-xs z-60 flex items-center justify-center p-4'>
      <div className='bg-card border border-border rounded-xl w-full max-w-sm p-6 shadow-2xl slide-in-from-bottom-2 animate-in fade-in duration-300'>
        <h3 className='text-lg font-bold text-foreground mb-2'>{title}</h3>
        <p className='text-muted-foreground mb-6'>{message}</p>
        <div className='flex justify-end gap-3'>
          <Button variant='ghost' onClick={onCancel}>
            Cancel
          </Button>
          <Button variant='destructive' onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

export function SaveModal({
  open,
  name,
  isPublic,
  onNameChange,
  onPublicChange,
  onSave,
  onClose,
}: {
  open: boolean;
  name: string;
  isPublic: boolean;
  onNameChange: (name: string) => void;
  onPublicChange: (isPublic: boolean) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className='fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4'>
      <div className='bg-card border border-border rounded-xl w-full max-w-md p-6 shadow-2xl'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-lg font-bold text-foreground'>Save Pattern</h2>
          <button
            onClick={onClose}
            className='text-muted-foreground hover:text-foreground'
          >
            <X className='w-5 h-5' />
          </button>
        </div>
        <div className='space-y-4'>
          <div>
            <label className='text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block'>
              Pattern Name
            </label>
            <Input
              value={name}
              onChange={e => onNameChange(e.target.value)}
              className='bg-background border-border text-foreground'
              placeholder='e.g. My Coding Helper'
              autoFocus
            />
          </div>
          <div className='flex items-start space-x-2 pt-2'>
            <input
              type='checkbox'
              id='isPublic'
              checked={isPublic}
              onChange={e => onPublicChange(e.target.checked)}
              className='mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
            />
            <div className='grid gap-1.5 leading-none'>
              <label
                htmlFor='isPublic'
                className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
              >
                Make Public (Share with Community)
              </label>
              <p className='text-xs text-muted-foreground'>
                {isPublic ? (
                  <span className='text-amber-600 dark:text-amber-400 font-medium'>
                    Note: Public prompts require admin approval before appearing
                    in the feed.
                  </span>
                ) : (
                  'Allows other users to view and rate your prompt.'
                )}
              </p>
            </div>
          </div>
          <div className='flex items-center justify-end gap-3 mt-6'>
            <Button variant='ghost' onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={onSave}
              className='bg-blue-600 hover:bg-blue-500 text-white'
            >
              Save Pattern
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
