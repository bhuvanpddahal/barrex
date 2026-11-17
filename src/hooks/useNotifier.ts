import { useState } from "react";

import type { InitialState, Notifier } from "../types";
import { notifier as createNotifier } from "../utils/notifier";

export function useNotifier<T>(initialState: InitialState<T>): Notifier<T> {
    const [notifier] = useState(() => createNotifier(initialState));
    return notifier;
}