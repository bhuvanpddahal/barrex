import { memo } from "react";

import type { IsolatedContainerProps } from "../types";

function IsolatedContainerComponent({ children }: IsolatedContainerProps) {
    return <>{children}</>;
}

/**
 * A boundary component designed to completely shield its child 
 * subtree from parent-driven re-render cascades.
 * 
 * @remarks
 * Children inside an `IsolatedContainer` can still re-render independently 
 * based on their own local state or external reactive bindings (like `barrex` notifiers).
 * 
 * @see [Barrex Docs](https://github.com/bhuvanpddahal/barrex/blob/main/docs/components/isolated-container.md)
 * 
 * @param props The component props.
 * 
 * @example
 * ```tsx
 * import { IsolatedContainer } from "barrex";
 * 
 * <IsolatedContainer>
 *   <StaticHeader/>
 *   <CounterWidget/>
 * </IsolatedContainer>
 * ```
 */
export const IsolatedContainer = memo(
    IsolatedContainerComponent,
    () => true
) as typeof IsolatedContainerComponent;