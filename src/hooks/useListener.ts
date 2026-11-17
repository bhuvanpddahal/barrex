import { useRef, useSyncExternalStore } from "react";

import type { Notifier, StatesComparer, StateSelector } from "../types";

/**
 * Subscribes a React component to a `barrex` notifier, enabling precise, 
 * fine-grained reactivity using `useSyncExternalStore`.
 * 
 * @remarks
 * Components re-render only when the exact state slice or computed selector 
 * value updates, preventing unnecessary re-renders across the tree.
 * 
 * @see [Barrex Docs](./docs/hooks/use-listener.md)
 * 
 * @template T The raw type of the source notifier state.
 * @template U The resolved type after applying the selector.
 * 
 * @param notifier The source notifier instance to subscribe to.
 * @param selector Optional function to transform or compute a specific slice from the notifier state.
 * @param areStatesEqual Optional custom comparer. Returns true to reuse the previous state reference and skip re-renders.
 * @returns The current resolved state (raw or selected).
 * 
 * @example
 * ```tsx
 * import { useListener } from "barrex";
 * 
 * function Counter() {
 *   const count = useListener(counterNotifier);
 *   return <span>Count: {count}</span>;
 * }
 * ```
 */
export function useListener<T, U = T>(
    notifier: Notifier<T>,
    selector?: StateSelector<T, U>,
    areStatesEqual?: StatesComparer<U>
): U {
    const prevState = useRef<U>(null);

    return useSyncExternalStore(
        notifier.subscribe,
        () => {
            const nextState = selector
                ? selector(notifier.get())
                : notifier.get() as unknown as U;
            if (areStatesEqual && prevState.current !== null) {
                const areEqual = areStatesEqual(prevState.current, nextState);
                if (areEqual) return prevState.current;
            }
            prevState.current = nextState;
            return nextState;
        },
        () => (selector ? selector(notifier.get()) : notifier.get() as unknown as U)
    );
}