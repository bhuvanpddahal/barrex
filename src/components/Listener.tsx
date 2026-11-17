import { memo } from "react";

import type { ListenerProps } from "../types";
import { useListener } from "../hooks/useListener";

function ListenerComponent<T, U = T>({
    notifier,
    selector,
    areStatesEqual,
    stableChild,
    children
}: ListenerProps<T, U>) {
    const state = useListener(notifier, selector, areStatesEqual);
    return children(state, stableChild);
}

/**
 * A declarative component wrapper that brings fine-grained reactivity 
 * and granular performance optimization directly into your JSX tree.
 * 
 * @remarks
 * Confines updates strictly to its render-prop children without forcing 
 * an entire component function to re-render.
 * 
 * @see [Barrex Docs](./docs/components/listener.md)
 * 
 * @param props The component props.
 * 
 * @example
 * ```tsx
 * import { Listener } from "barrex";
 * 
 * <Listener notifier={userNotifier.name}>
 *   {(name) => <h1>Welcome, {name}!</h1>}
 * </Listener>
 * ```
 */
export const Listener = memo(
    ListenerComponent,
    (prevProps, nextProps) => {
        if (nextProps.isolated) return true;
        return (
            prevProps.notifier === nextProps.notifier &&
            prevProps.selector === nextProps.selector &&
            prevProps.areStatesEqual === nextProps.areStatesEqual &&
            prevProps.stableChild === nextProps.stableChild &&
            prevProps.children === nextProps.children
        );
    }
) as typeof ListenerComponent;