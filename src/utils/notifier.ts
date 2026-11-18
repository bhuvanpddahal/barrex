import { NotifierRoot } from "../notifier";
import { isFunction, isNotifier } from "./helpers";
import type { InitialState, Notifier } from "../types";

const functionCannotBeNotifierMessage =
    "A function cannot be a notifier. Replace it with other value, or add it as a property/method inside an object, or don't wrap it with notifier.";

/**
 * Creates a core, global root-level state container wrapped in a deeply reactive proxy tree.
 * 
 * @remarks
 * Serves as the primary entry point for global stores outside of React. Every nested property 
 * automatically becomes a sub-notifier. Raw functions cannot be notifiers and will throw an error.
 * 
 * @see [Barrex Docs](https://github.com/bhuvanpddahal/barrex/blob/main/docs/utils/notifier.md)
 * 
 * @template T The shape of the initial state.
 * @param initialState The initial value of the state, or a lazy initialization function returning the state.
 * @returns A root Notifier proxy instance.
 * 
 * @example
 * ```ts
 * import { notifier } from "barrex";
 * 
 * const authNotifier = notifier({
 *   user: null,
 *   isAuthenticated: false
 * });
 * ```
 */
export function notifier<T>(initialState: InitialState<Notifier<T>>): Notifier<T>;
export function notifier<T>(initialState: InitialState<T>): Notifier<T>;
export function notifier<T>(initialState: unknown): Notifier<T> {
    const resolvedState = isFunction(initialState)
        ? (initialState)()
        : initialState;
    if (isFunction(resolvedState)) {
        throw new Error(functionCannotBeNotifierMessage);
    }
    if (isNotifier(resolvedState)) {
        return resolvedState as Notifier<T>;
    }
    return createNotifier(resolvedState);
}

function createNotifier<T>(state: T): Notifier<T> {
    const root = new NotifierRoot(state);
    return root.rootNode.proxy as Notifier<T>;
}