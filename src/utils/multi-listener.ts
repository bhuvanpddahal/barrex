import type {
    InferNotifierValues,
    ListenerCallback,
    Notifier,
    VoidCallback
} from "../types";
import { areStatesEqual } from "./helpers";

/**
 * Subscribes imperatively to multiple `barrex` notifiers simultaneously outside of React.
 * 
 * @remarks
 * Accepts a tuple array of notifiers, infers their types automatically, executes 
 * the callback immediately with the initial values tuple, and returns a single composite cleanup function.
 * 
 * @see [Barrex Docs](https://github.com/bhuvanpddahal/barrex/blob/main/docs/utils/multi-listener.md)
 * 
 * @param notifiers A readonly tuple array of source notifiers to subscribe to.
 * @param callback A callback function invoked immediately with the values tuple and on subsequent updates.
 * @returns A composite cleanup function to unsubscribe from all provided notifiers.
 * 
 * @example
 * ```ts
 * import { multiListener } from "barrex";
 * 
 * const unsubscribe = multiListener(
 *   [userNotifier.name, settingsNotifier.theme],
 *   ([name, theme]) => {
 *     console.log(`User: ${name}, Theme: ${theme}`);
 *   }
 * );
 * ```
 */
export function multiListener<
    const T extends readonly Notifier<unknown>[]
>(
    notifiers: T,
    callback: ListenerCallback<InferNotifierValues<T>>
): VoidCallback {
    let prevState: any = null;
    const listener = () => {
        const nextState = notifiers.map((notifier) => notifier.get()) as any;
        if (!areStatesEqual(prevState, nextState)) {
            callback(nextState);
            prevState = nextState;
        }
    };
    const unsubscribeFns = notifiers.map((notifier) => {
        return notifier.subscribe(listener);
    });
    const unsubscribe = () => unsubscribeFns.forEach((fn) => fn());
    listener();
    return unsubscribe;
}