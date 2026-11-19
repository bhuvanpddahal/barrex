import type { Notifier } from "../types";
import { NOTIFIER_SYMBOL } from "../symbols";

export function isObjectOrArray(value: unknown): value is object {
    return typeof value === "object" && value !== null;
}

export function isArray(value: unknown): value is Array<unknown> {
    return Array.isArray(value);
}

export function isFunction(value: unknown): value is Function {
    return typeof value === "function";
}

export function isNotifier(value: unknown): value is Notifier<unknown> {
    return (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value) &&
        (value as any)[NOTIFIER_SYMBOL] === true
    );
}

export function areStatesEqual<T>(prevState: T, nextState: T) {
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