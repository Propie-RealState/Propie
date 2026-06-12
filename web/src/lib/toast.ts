type ToastListener = (message: string) => void;

let listener: ToastListener | null = null;

export function showToast(message: string) {
  listener?.(message);
}

export function setToastListener(next: ToastListener | null) {
  listener = next;
}
