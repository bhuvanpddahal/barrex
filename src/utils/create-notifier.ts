import { isFunction } from "./helpers";
import { NotifierRoot } from "../notifier";
import type { InitialState, Notifier } from "../types";

const functionCannotBeNotifierMessage =
    "A function cannot be a notifier. Replace it with other value, or add it as a property/method inside an object, or don't wrap it with notifier.";

export function createNotifier<T>(initialState: InitialState<T>): Notifier<T> {
    const state = (isFunction(initialState)
        ? (initialState as () => T)()
        : initialState) as T;
    if (isFunction(state)) {
        throw new Error(functionCannotBeNotifierMessage);
    }
    return createNotifierInternal(state);
}

function createNotifierInternal<T>(state: T): Notifier<T> {
    const root = new NotifierRoot(state);
    return root.rootNode.proxy as Notifier<T>;
}