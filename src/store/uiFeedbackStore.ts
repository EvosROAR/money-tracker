import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

interface ToastState {
  message: string;
  type: ToastType;
  visible: boolean;
}

interface ConfirmState {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  destructive: boolean;
  onConfirm: (() => void | Promise<void>) | null;
}

interface UiFeedbackState {
  toast: ToastState;
  confirm: ConfirmState;
  showToast: (message: string, options?: { type?: ToastType; duration?: number }) => void;
  hideToast: () => void;
  showConfirm: (options: {
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    destructive?: boolean;
    onConfirm: () => void | Promise<void>;
  }) => void;
  hideConfirm: () => void;
  resolveConfirm: () => void;
}

const defaultToast: ToastState = {
  message: '',
  type: 'info',
  visible: false,
};

const defaultConfirm: ConfirmState = {
  visible: false,
  title: '',
  message: '',
  confirmText: '',
  cancelText: '',
  destructive: false,
  onConfirm: null,
};

let toastTimer: ReturnType<typeof setTimeout> | null = null;

export const useUiFeedbackStore = create<UiFeedbackState>((set, get) => ({
  toast: defaultToast,
  confirm: defaultConfirm,

  showToast: (message, options) => {
    const type = options?.type ?? 'info';
    const duration = options?.duration ?? 5000;

    if (toastTimer) clearTimeout(toastTimer);

    set({ toast: { message, type, visible: true } });

    toastTimer = setTimeout(() => {
      set({ toast: { ...get().toast, visible: false } });
      toastTimer = null;
    }, duration);
  },

  hideToast: () => {
    if (toastTimer) {
      clearTimeout(toastTimer);
      toastTimer = null;
    }
    set({ toast: { ...get().toast, visible: false } });
  },

  showConfirm: (options) => {
    set({
      confirm: {
        visible: true,
        title: options.title,
        message: options.message,
        confirmText: options.confirmText,
        cancelText: options.cancelText,
        destructive: options.destructive ?? false,
        onConfirm: options.onConfirm,
      },
    });
  },

  hideConfirm: () => {
    set({ confirm: defaultConfirm });
  },

  resolveConfirm: () => {
    const { onConfirm } = get().confirm;
    set({ confirm: defaultConfirm });
    if (onConfirm) void onConfirm();
  },
}));
