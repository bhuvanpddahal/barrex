import { useState } from "react";

import type { InitialState, Notifier } from "../types";
import { createNotifier } from "../utils/create-notifier";

export function useNotifier<T>(initialState: InitialState<T>): Notifier<T> {
    const [notifier] = useState(() => createNotifier(initialState));
    return notifier;
}