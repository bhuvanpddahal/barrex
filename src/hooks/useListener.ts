import { useRef, useSyncExternalStore } from "react";

import type { Notifier, StatesComparer, StateSelector } from "../types";

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