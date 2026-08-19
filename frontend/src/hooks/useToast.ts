import { useState, useCallback } from 'react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (type: ToastMessage['type'], title: string, description?: string) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastMessage = { id, type, title, description };
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
    success: (title: string, desc?: string) => addToast('success', title, desc),
    error: (title: string, desc?: string) => addToast('error', title, desc),
    info: (title: string, desc?: string) => addToast('info', title, desc),
    warning: (title: string, desc?: string) => addToast('warning', title, desc),
  };
}
