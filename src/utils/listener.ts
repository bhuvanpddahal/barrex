import type { ListenerCallback, Notifier, VoidCallback } from "../types";

export function listener<T>(
    notifier: Notifier<T>,
    callback: ListenerCallback<T>
): VoidCallback {
    const unsubscribe = notifier.subscribe(() => {
        callback(notifier.get());
    });
    callback(notifier.get());
    return unsubscribe;
}