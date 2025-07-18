'use client';

import { AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ContentItem } from '@/types/library';

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: ContentItem | null;
  action: 'delete' | 'archive' | 'publish' | 'unpublish';
  onConfirm: () => void;
  loading?: boolean;
}

function getDialogContent(action: string, content: ContentItem | null) {
  if (!content) return { title: '', description: '', confirmText: '', variant: 'default' as const };

  const contentTypeLabel = content.type === 'blog' ? 'blog post' : content.type;

  switch (action) {
    case 'delete':
      return {
        title: `Delete ${contentTypeLabel}?`,
        description: `Are you sure you want to delete "${content.title}"? This action cannot be undone.`,
        confirmText: 'Delete',
        variant: 'destructive' as const,
        icon: Trash2
      };
    case 'archive':
      return {
        title: `Archive ${contentTypeLabel}?`,
        description: `"${content.title}" will be moved to your archive and won't be visible to others.`,
        confirmText: 'Archive',
        variant: 'default' as const,
        icon: AlertTriangle
      };
    case 'publish':
      return {
        title: `Publish ${contentTypeLabel}?`,
        description: `"${content.title}" will be made public and visible to all users.`,
        confirmText: 'Publish',
        variant: 'default' as const,
        icon: AlertTriangle
      };
    case 'unpublish':
      return {
        title: `Unpublish ${contentTypeLabel}?`,
        description: `"${content.title}" will be made private and no longer visible to others.`,
        confirmText: 'Unpublish',
        variant: 'default' as const,
        icon: AlertTriangle
      };
    default:
      return {
        title: 'Confirm action',
        description: 'Are you sure you want to perform this action?',
        confirmText: 'Confirm',
        variant: 'default' as const,
        icon: AlertTriangle
      };
  }
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  content,
  action,
  onConfirm,
  loading = false
}: ConfirmationDialogProps) {
  const dialogContent = getDialogContent(action, content);
  const Icon = dialogContent.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              dialogContent.variant === 'destructive' 
                ? 'bg-red-500/20 text-red-400' 
                : 'bg-orange-500/20 text-orange-400'
            }`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-white">
                {dialogContent.title}
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-gray-400 mt-2">
            {dialogContent.description}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button
            variant={dialogContent.variant}
            onClick={onConfirm}
            disabled={loading}
            className={
              dialogContent.variant === 'destructive'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-orange-600 hover:bg-orange-700 text-white'
            }
          >
            {loading ? 'Processing...' : dialogContent.confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}