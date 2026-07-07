import { useUiFeedbackStore, ToastType } from '@/store/uiFeedbackStore';

export const showToast = (
  message: string,
  options?: { type?: ToastType; duration?: number },
): void => {
  useUiFeedbackStore.getState().showToast(message, options);
};

interface ConfirmOptions {
  confirmText: string;
  cancelText: string;
  destructive?: boolean;
}

export const confirmAction = (
  title: string,
  message: string,
  onConfirm: () => void | Promise<void>,
  options: ConfirmOptions,
): void => {
  useUiFeedbackStore.getState().showConfirm({
    title,
    message,
    confirmText: options.confirmText,
    cancelText: options.cancelText,
    destructive: options.destructive,
    onConfirm,
  });
};
