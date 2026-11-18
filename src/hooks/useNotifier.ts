import { useState } from "react";

import type { InitialState, Notifier } from "../types";
import { notifier as createNotifier } from "../utils/notifier";

/**
 * Creates a component-scoped, lazy-initialized notifier with automatic 
 * proxy-driven nested reactivity.
 * 
 * @remarks
 * Tied directly to the component lifecycle. Every property on the initial state 
 * object automatically becomes a first-class sub-notifier.
 * 
 * @see [Barrex Docs](https://github.com/bhuvanpddahal/barrex/blob/main/docs/hooks/use-notifier.md)
 * 
 * @template T The shape of the initial state.
 * @param initialState The initial value or a lazy initializer function returning the state.
 * @returns A root Notifier proxy instance.
 * 
 * @example
 * ```tsx
 * import { useNotifier, useListener } from "barrex";
 * 
 * function Profile() {
 *   const userNotifier = useNotifier({ name: "Alice", age: 40 });
 *   const name = useListener(userNotifier.name);
 *   return <p>{name}</p>;
 * }
 * ```
 */
export function useNotifier<T>(initialState: InitialState<T>): Notifier<T> {
    const [notifier] = useState(() => createNotifier(initialState));
    return notifier;
}