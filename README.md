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
import { createNotifier } from "barrex";

// Define your plain state object type
interface AppState {
	count: number;
	user: {
		name: string;
		isLoggedIn: boolean;
	};
}

// Create the notifier
export const appNotifier = createNotifier<AppState>({
	count: 0,
	user: {
		name: "Alice",
		isLoggedIn: false
	}
});
```

### 2. Use in React Components

```tsx
import { useListener } from "barrex";

import { appNotifier } from "./app-notifier";

export function Counter() {
	// Fine-grained subscription: component only re-renders when `count` changes
	const count = useListener(appNotifier.count);

	return (
		<div>
			<p>Count: {count}</p>
			{/* Explicit .set() method with updater support */}
			<button onClick={() => appNotifier.count.set((c) => c + 1)}>
				Increment
			</button>
			<button onClick={() => appNotifier.count.set(0)}>Reset</button>
		</div>
	);
}
```

---

## License

[MIT](https://github.com/bhuvanpddahal/barrex/blob/HEAD/LICENSE)
