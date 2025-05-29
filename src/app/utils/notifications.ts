import { toast, ToastOptions } from 'react-hot-toast';

/**
 * Display a simple toast notification.
 * @param message The message to show.
 * @param options Optional toast configuration.
 */
export function notify(message: string, options?: ToastOptions) {
  return toast(message, options);
}

/**
 * Display a success toast notification.
 * @param message The message to show.
 * @param options Optional toast configuration.
 */
export function notifySuccess(message: string, options?: ToastOptions) {
  return toast.success(message, options);
}

/**
 * Display an error toast notification.
 * @param message The message to show.
 * @param options Optional toast configuration.
 */
export function notifyError(message: string, options?: ToastOptions) {
  return toast.error(message, options);
}

/**
 * Display an info toast notification.
 * @param message The message to show.
 * @param options Optional toast configuration.
 */
export function notifyInfo(message: string, options?: ToastOptions) {
  return toast(message, options);
}

/**
 * Display a loading toast notification.
 * @param message The message to show.
 * @param options Optional toast configuration.
 */
export function notifyLoading(message: string, options?: ToastOptions) {
  return toast.loading(message, options);
}

/**
 * Display notifications tied to the lifecycle of a promise.
 * @param promise The promise to track.
 * @param messages Messages for loading, success, and error states.
 * @param options Optional toast configuration.
 */
export function notifyPromise<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((err: any) => string);
  },
  options?: ToastOptions
) {
  return toast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
  }, options);
}