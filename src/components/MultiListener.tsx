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