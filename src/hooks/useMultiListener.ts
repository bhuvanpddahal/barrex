import { useCallback, useRef, useSyncExternalStore } from "react";

import type {
    InferNotifierValues,
    Notifier,
    StatesComparer,
    StateSelector,
    VoidCallback
} from "../types";
import { isArray } from "../utils/helpers";

function areStatesEqualFn<T>(prevState: T, nextState: T) {
    if (
        isArray(prevState) &&
        isArray(nextState) &&
        prevState.length === nextState.length
    ) {
        return prevState.every((prevValue, index) => {
            const nextValue = nextState[index];
            return prevValue === nextValue;
        });
    }
    return prevState === nextState;
};

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