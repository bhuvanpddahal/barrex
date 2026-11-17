import type {
    InferNotifierValues,
    ListenerCallback,
    Notifier,
    VoidCallback
} from "../types";

export function multiListener<
    const T extends readonly Notifier<unknown>[]
>(
    notifiers: T,
    callback: ListenerCallback<InferNotifierValues<T>>
): VoidCallback {
    const listener = () => {
        const state = notifiers.map((notifier) => notifier.get()) as any;
        callback(state);
    };
    const unsubscribeFns = notifiers.map((notifier) => {
        return notifier.subscribe(listener);
    });
    const unsubscribe = () => unsubscribeFns.forEach((fn) => fn());
    listener();
    return unsubscribe;
}