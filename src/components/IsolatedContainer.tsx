import { memo } from "react";

import type { IsolatedContainerProps } from "../types";

function IsolatedContainerComponent({ children }: IsolatedContainerProps) {
    return <>{children}</>;
}

export const IsolatedContainer = memo(
    IsolatedContainerComponent,
    () => true
) as typeof IsolatedContainerComponent;