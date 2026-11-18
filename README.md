# barrex

> The bare essentials for state management in React.

`barrex` is a lightweight, explicit, and fully-typed React state management library built on a proxy-driven path architecture. Designed as a predictable, no-magic alternative, it gives you fine-grained reactivity with a clean `.get()`, `.set()`, and `.subscribe()` API powered by `useSyncExternalStore`.

---

## Installation

```bash
npm install barrex
```

_(Requires `react` >= 18 as a peer dependency)_

---

## Quick Start

### 1. Create a Notifier

```ts
import { notifier } from "barrex";

// Define your plain state object type
interface CounterState {
  count: number;
  increment: () => boolean;
  reset: () => boolean;
}

// Initialize the notifier
export const counterNotifier = notifier<CounterState>({
  count: 0,
  increment: (): boolean => counterNotifier.count.set((c) => c + 1),
  reset: (): boolean => counterNotifier.count.set(0),
});
```

### 2. Use in React Components

```tsx
import { useListener } from "barrex";

import { counterNotifier } from "./counter-notifier";

export function Counter() {
  // Fine-grained subscription: component only re-renders when `count` changes
  const count = useListener(counterNotifier.count);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={counterNotifier.increment}>Increment</button>
      <button onClick={counterNotifier.reset}>Reset</button>
    </div>
  );
}
```

---

## References

- **[Core Concepts](./docs/core-concepts.md)**
- **Utilities**
  - [notifier](./docs/utils/notifier.md)
  - [listener](./docs/utils/listener.md)
  - [multiListener](./docs/utils/multi-listener.md)
- **Hooks**
  - [useNotifier](./docs/hooks/use-notifier.md)
  - [useListener](./docs/hooks/use-listener.md)
  - [useMultiListener](./docs/hooks/use-multi-listener.md)
- **Components**
  - [Listener](./docs/components/listener.md)
  - [MultiListener](./docs/components/multi-listener.md)
  - [IsolatedContainer](./docs/components/isolated-container.md)

---

## License

[MIT](https://github.com/bhuvanpddahal/barrex/blob/HEAD/LICENSE)
