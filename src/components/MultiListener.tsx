import { memo } from "react";

import { useMultiListener } from "../hooks/useMultiListener";
import type { MultiListenerComponent as MultiListenerComponentType } from "../types";

function MultiListenerComponent({
    notifiers,
    selector,
    areStatesEqual,
    stableChild,
    children
}: any) {
    const state = useMultiListener(notifiers, selector, areStatesEqual);
    return children(state, stableChild);
}

/**
 * An advanced declarative component wrapper that enables fine-grained 
 * subscriptions to multiple notifiers simultaneously with full type safety.
 * 
 * @remarks
 * Automatically infers tuple types from the provided notifiers array 
 * and includes smart array equality checking.
 * 
 * @see [Barrex Docs](./docs/components/multi-listener.md)
 * 
 * @param props The component props.
 * 
 * @example
 * ```tsx
 * import { MultiListener } from "barrex";
 * 
 * <MultiListener notifiers={[userNotifier.name, cartNotifier.count]}>
 *   {([name, count]) => <p>{name} has {count} items</p>}
 * </MultiListener>
 * ```
 */
export const MultiListener: MultiListenerComponentType = memo(
    MultiListenerComponent,
    (prevProps, nextProps) => {
        if (nextProps.isolated) return true;
        return (
            prevProps.notifiers === nextProps.notifiers &&
            prevProps.selector === nextProps.selector &&
            prevProps.areStatesEqual === nextProps.areStatesEqual &&
            prevProps.stableChild === nextProps.stableChild &&
            prevProps.children === nextProps.children
        );
    }
);