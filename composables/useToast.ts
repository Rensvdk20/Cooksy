import { ToastType, type ToastState } from "~/types/toast";

const toasts = ref<ToastState[]>([]);
let toastCount = 0;

const ANIMATION_DURATION = 100;

export const useToast = () => {
    const showToast = (message: string, type: ToastType = ToastType.Info, duration = 5000) => {
        const id = toastCount++;
        const toast: ToastState = { id, message, type, open: true };
        toasts.value.push(toast);

        toast.timeoutId = setTimeout(() => hideToast(id), duration);
    };

    const hideToast = (id: number) => {
        const toast = toasts.value.find(t => t.id === id);
        if (!toast) return;

        if (toast.timeoutId) clearTimeout(toast.timeoutId);

        toast.open = false;

        setTimeout(() => {
            toasts.value = toasts.value.filter(t => t.id !== id);
        }, ANIMATION_DURATION);
    };

    return {
        toasts: readonly(toasts),
        showToast,
        hideToast
    };
};
