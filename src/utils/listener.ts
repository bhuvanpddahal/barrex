import type { ListenerCallback, Notifier, VoidCallback } from "../types";

/**
 * Subscribes imperatively to a `barrex` notifier outside of React component trees.
 * 
 * @remarks
 * Executes the callback immediately upon registration with the current state value, 
 * and subsequently every time the notifier updates. Returns a cleanup function to unsubscribe.
 * 
 * @see [Barrex Docs](./docs/utils/listener.md)
 * 
 * @param notifier The source notifier instance to subscribe to.
 * @param callback A callback function invoked immediately and on every state update.
 * @returns A cleanup function to remove the subscription.
 * 
 * @example
 * ```ts
 * import { listener } from "barrex";
 * 
 * const unsubscribe = listener(themeNotifier, (theme) => {
 *   localStorage.setItem("theme", theme);
 * });
 * ```
 */
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