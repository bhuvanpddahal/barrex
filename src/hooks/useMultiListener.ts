import { useCallback, useRef, useSyncExternalStore } from "react";

import type {
    InferNotifierValues,
    Notifier,
    StatesComparer,
    StateSelector,
    VoidCallback
} from "../types";
import { areStatesEqual as areStatesEqualFn } from "../utils/helpers";

/**
 * Subscribes a React component to multiple notifiers simultaneously, 
 * offering complete type safety and optimized derivations.
 * 
 * @remarks
 * Bundles multiple notifier subscriptions into a single unified cleanup routine 
 * and includes smart array/tuple shallow comparison by default.
 * 
 * @see [Barrex Docs](https://github.com/bhuvanpddahal/barrex/blob/main/docs/hooks/use-multi-listener.md)
 * 
 * @param notifiers A readonly tuple array of source notifiers to subscribe to.
 * @param selector Optional function to transform or combine the tuple values into a custom shape.
 * @param areStatesEqual Optional custom comparator. Defaults to a smart tuple-aware shallow equality checker.
 * @returns The resolved state tuple or the computed selector output.
 * 
 * @example
 * ```tsx
 * import { useMultiListener } from "barrex";
 * 
 * function Header() {
 *   const [name, theme] = useMultiListener([userNotifier.name, themeNotifier]);
 *   return <header className={theme}>Welcome, {name}</header>;
 * }
 * ```
 */
export function useMultiListener<
    const T extends readonly Notifier<unknown>[],
    const U
>(
    notifiers: T,
    selector: StateSelector<InferNotifierValues<T>, U>,
    areStatesEqual?: StatesComparer<U>
): U;

export function useMultiListener<
    const T extends readonly Notifier<unknown>[]
>(
    notifiers: T,
    selector?: undefined,
    areStatesEqual?: StatesComparer<InferNotifierValues<T>>
): InferNotifierValues<T>;

export function useMultiListener(
    notifiers: Notifier<unknown>[],
    selector?: StateSelector<any, any>,
    areStatesEqual: StatesComparer<any> = areStatesEqualFn
): unknown {
    const prevState = useRef<unknown>(null);

    const subscribe = useCallback((callback: VoidCallback) => {
        const unsubscribeFns = notifiers.map((notifier) => {
            return notifier.subscribe(callback);
        });
        return () => unsubscribeFns.forEach((fn) => fn());
    }, notifiers);

    const getSnapshot = () => {
        const state = notifiers.map((notifier) => notifier.get());
        const nextState = selector ? selector(state) : state;
        if (prevState.current !== null) {
            const areEqual = areStatesEqual(prevState.current, nextState);
            if (areEqual) return prevState.current;
        }
        prevState.current = nextState;
        return nextState;
    };

    return useSyncExternalStore(
        subscribe,
        getSnapshot,
        getSnapshot
    );
}