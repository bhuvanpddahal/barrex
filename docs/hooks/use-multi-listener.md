# useMultiListener

The `useMultiListener` hook is an advanced primitive in `barrex` designed to subscribe React function components to **multiple notifiers simultaneously**, offering complete type safety over tuples and derived data.

---

## Overview

When a component needs to compute its state or render based on multiple independent notifier sources, coordinating them manually can become complex. `useMultiListener` accepts a readonly tuple array of notifiers, aggregates their updates, and guarantees strict end-to-end TypeScript inference over the resulting values.

Like `useListener`, it is built natively on top of `useSyncExternalStore` and includes built-in smart array comparison to prevent redundant re-renders.

---

## API Reference

### Import

```tsx
import { useMultiListener } from "barrex";
```

### Signatures & Overloads

```ts
// Overload 1: With a selector transformation
export function useMultiListener<
	const T extends readonly Notifier<unknown>[],
	const U
>(
	notifiers: T,
	selector: StateSelector<InferNotifierValues<T>, U>,
	areStatesEqual?: StatesComparer<U>
): U;

// Overload 2: Without a selector (returns a typed value tuple)
export function useMultiListener<const T extends readonly Notifier<unknown>[]>(
	notifiers: T,
	selector?: undefined,
	areStatesEqual?: StatesComparer<InferNotifierValues<T>>
): InferNotifierValues<T>;
```

### Parameters

| Parameter        | Type                                    | Default            | Description                                                                                |
| ---------------- | --------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------ |
| `notifiers`      | `readonly Notifier<unknown>[]`          | **Required**       | A readonly tuple array of source notifiers to subscribe to.                                |
| `selector`       | `(values: InferNotifierValues<T>) => U` | `undefined`        | Optional function to transform or compute a custom derived shape from the combined states. |
| `areStatesEqual` | `StatesComparer`                        | `areStatesEqualFn` | Optional custom comparator. Defaults to a smart tuple-aware shallow equality checker.      |

---

## Deep Dive: Core Features & Mechanics

### 1. Automatic Tuple Inference (`InferNotifierValues`)

Thanks to TypeScript mapped tuple types, passing an array of notifiers like `[userNotifier, settingsNotifier]` automatically types the returned state as a matching tuple `[User, Settings]` without requiring manual generic type arguments.

### 2. Smart Tuple Equality Checking (`areStatesEqualFn`)

When listening to multiple notifiers without a selector, `useMultiListener` evaluates a fresh array of values on every read. To prevent this from triggering unnecessary re-renders due to reference changes, the built-in default comparator (`areStatesEqualFn`) automatically inspects array lengths and shallow-compares element values item-by-item (`prevValue === nextValue`). If all individual notifier values match their previous values, the previous state reference is reused and re-rendering is safely skipped.

### 3. Derived State with Selectors

If you need to calculate a combined value (such as computing a total cart price from separate item and discount notifiers), providing a `selector` function ensures your component only updates when the _final computed return value_ changes.

### 4. Consolidated Subscription Lifecycle

The hook bundles subscriptions across all provided notifiers cleanly into a single unified cleanup routine via `useCallback`, ensuring optimal performance and no dangling listeners during unmounts.

---

## Usage Examples

### Example 1: Basic Multi-Notifier Tuple Destructuring

```tsx
import { useMultiListener } from "barrex";
import { userNotifier, themeNotifier } from "./store";

export function UserHeader() {
	// Automatically typed as [User, Theme]
	const [user, theme] = useMultiListener([userNotifier, themeNotifier]);

	return (
		<header className={theme}>
			<h1>Welcome, {user.name}</h1>
		</header>
	);
}
```

### Example 2: Advanced Usage with a Selector and Custom Comparator

This example demonstrates combining multiple data sources to compute a permission flag and using a custom equality function.

```tsx
import { useMultiListener } from "barrex";
import { authNotifier, subscriptionNotifier } from "./store";

export function PremiumFeatureBanner() {
	// Combine two notifiers into a single derived boolean value
	const hasAccess = useMultiListener(
		[authNotifier, subscriptionNotifier],
		([auth, sub]) => auth.isLoggedIn && sub.tier === "premium",
		// Optional custom boolean comparator
		(prev, next) => prev === next
	);

	if (!hasAccess) {
		return <p>Upgrade to Premium to unlock this feature.</p>;
	}

	return <div className="premium-content">🚀 Exclusive Premium Content</div>;
}
```
