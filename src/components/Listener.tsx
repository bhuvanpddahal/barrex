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