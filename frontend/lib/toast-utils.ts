import { toast } from "sonner";

// Keep track of recently shown toasts to prevent spam
const recentToasts = new Map<string, number>();
const TOAST_COOLDOWN_MS = 2000; // 2 seconds before same message can be shown again

/**
 * Shows a debounced toast message to prevent spamming the user with identical errors.
 * Best used for repetitive errors like "Invalid Ticket Format" during large batch parsing.
 */
export function debouncedToast(message: string, type: "success" | "error" | "info" | "warning" = "info", id?: string) {
  const toastKey = id || message;
  const now = Date.now();
  const lastShown = recentToasts.get(toastKey);

  if (!lastShown || now - lastShown > TOAST_COOLDOWN_MS) {
    recentToasts.set(toastKey, now);
    
    switch (type) {
      case "success":
        toast.success(message, { id: toastKey });
        break;
      case "error":
        toast.error(message, { id: toastKey });
        break;
      case "warning":
        toast.warning(message, { id: toastKey });
        break;
      case "info":
      default:
        toast.info(message, { id: toastKey });
        break;
    }
  }
}

/**
 * Wraps a long-running promise with a toast that updates optimistically.
 * @param promise The async operation to execute
 * @param loadingMsg Message to show while loading
 * @param successMsg Message to show on success (or function that returns a message based on result)
 * @param errorMsg Message to show on error (or function that returns a message based on error)
 */
export function promiseToast<T>(
  promise: Promise<T>,
  loadingMsg: string,
  successMsg: string | ((data: T) => string),
  errorMsg: string | ((error: any) => string)
): Promise<T> {
  return toast.promise(promise, {
    loading: loadingMsg,
    success: successMsg,
    error: errorMsg,
  }) as unknown as Promise<T>;
}
