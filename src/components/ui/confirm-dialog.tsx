import { AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title = 'Xác nhận',
  description,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onCancel(); }}>
      <DialogContent className="max-w-sm rounded-2xl p-0 overflow-hidden">
        {/* Top accent bar */}
        <div className={`h-1.5 w-full ${variant === 'danger' ? 'bg-red-500' : 'bg-amber-500'}`} />

        <div className="px-6 pt-5 pb-6">
          <DialogHeader className="mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                variant === 'danger' ? 'bg-red-100' : 'bg-amber-100'
              }`}>
                <AlertTriangle className={`w-5 h-5 ${
                  variant === 'danger' ? 'text-red-600' : 'text-amber-600'
                }`} />
              </div>
              <DialogTitle className="text-lg font-bold text-slate-800 leading-snug">
                {title}
              </DialogTitle>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed pl-14">
              {description}
            </p>
          </DialogHeader>

          <DialogFooter className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1 h-10 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              {cancelLabel}
            </Button>
            <Button
              onClick={onConfirm}
              className={`flex-1 h-10 rounded-xl font-semibold text-white shadow-sm ${
                variant === 'danger'
                  ? 'bg-red-600 hover:bg-red-700 shadow-red-200'
                  : 'bg-amber-500 hover:bg-amber-600 shadow-amber-200'
              }`}
            >
              {confirmLabel}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
