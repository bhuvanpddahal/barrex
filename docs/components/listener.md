# Listener

The `Listener` is a declarative component wrapper that brings fine-grained reactivity and granular performance optimization directly into your JSX tree. It serves as the component-based counterpart to the `useListener` hook.

---

## Overview

Instead of forcing an entire component function to re-render when a piece of state changes, `Listener` confines updates strictly to its render-prop children. By leveraging `barrex` notifiers, it allows you to subscribe precisely to the data you care about with minimal boilerplate.

In addition to reactive data binding, `Listener` includes built-in performance controls—such as custom state comparison, static child preservation, and parent-render isolation.

---

## API Reference

### Import

```tsx
import { Listener } from "barrex";
```

### Props (`ListenerProps<T, U>`)

| Prop             | Type                                                 | Default      | Description                                                                                            |
| ---------------- | ---------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------ |
| `notifier`       | `Notifier<T>`                                        | **Required** | The source notifier instance to listen to.                                                             |
| `selector`       | `(state: T) => U`                                    | `undefined`  | Optional function to compute or extract a specific slice from the notifier state.                      |
| `areStatesEqual` | `(prev: U, next: U) => boolean`                      | `undefined`  | Optional custom comparer. Returns `true` to skip re-rendering when states are deemed equal.            |
| `stableChild`    | `JSX.Element`                                        | `undefined`  | A pre-rendered element passed to the render function that is insulated from state update re-renders.   |
| `isolated`       | `boolean`                                            | `false`      | When `true`, prevents the `Listener` component from re-rendering when its parent component re-renders. |
| `children`       | `(state: U, stableChild?: JSX.Element) => ReactNode` | **Required** | A render-prop function receiving the reactive state and optional `stableChild`.                        |

---

## Deep Dive: Core Features & Mechanics

### 1. Selectors & Granular Computation

If you pass a `selector` function, `Listener` will only trigger a re-render when the _computed return value_ of the selector changes. This is ideal for transforming raw state or deriving boolean flags (e.g., checking if an item exists in a collection).

### 2. Custom Equality Checking (`areStatesEqual`)

By default, `barrex` performs standard equality checks on state updates. If you are managing complex objects or arrays where reference identity changes but structural equality holds, provide an `areStatesEqual` callback:

- Returning `true` tells `barrex` the states are equal $\rightarrow$ **skips re-render**.
- Returning `false` tells `barrex` the states have changed $\rightarrow$ **triggers re-render**.

### 3. Protecting Subtrees with `stableChild`

When state updates inside the render prop, standard React behavior causes everything inside `children` to re-render. Passing a `stableChild` element allows you to inject a pre-memoized or static sub-tree directly into your render callback that will **never** re-render when the notifier updates.

### 4. Performance Firewalling via `isolated`

Because `barrex` notifiers are stable object references, you can safely pass them down through parent components.

- Setting `isolated={true}` instructs `memo` inside `Listener` to completely ignore parent-driven re-renders.
- The component will **only** re-render when its underlying notifier state changes, shielding it entirely from unrelated layout updates in parent components.

---

## Usage Examples

### Example 1: Basic Counter with a Selector

```tsx
import React from "react";
import { Listener } from "barrex";
import { userNotifier } from "./store";

export function UserGreeting() {
	return (
		<Listener
			notifier={userNotifier.profile}
			selector={(state) => `${state.firstName} ${state.lastName}`}
		>
			{(name) => <h1>Welcome back, {name}!</h1>}
		</Listener>
	);
}
```

### Example 2: Advanced Performance Optimization (`isolated` + `stableChild`)

This example demonstrates how to isolate the listener from parent re-renders while keeping a heavy, static header untouched when the counter updates.

```tsx
import React, { useState } from "react";
import { Listener } from "barrex";
import { counterNotifier } from "./store";

export function Dashboard() {
	const [theme, setTheme] = useState("light");

	return (
		<div className={theme}>
			<button
				onClick={() => setTheme(theme === "light" ? "dark" : "light")}
			>
				Toggle Theme (Triggers Parent Re-render)
			</button>

			{/* 
        isolated={true} ensures Dashboard theme changes 
        do NOT cause this Listener block to re-render. 
      */}
			<Listener
				notifier={counterNotifier}
				isolated={true}
				stableChild={
					<div className="static-banner">Dashboard Metrics</div>
				}
			>
				{(count, stableChild) => (
					<div className="counter-card">
						{stableChild}{" "}
						{/* Will never re-render when count changes */}
						<p>Current Count: {count}</p>
						<button
							onClick={() => counterNotifier.set((c) => c + 1)}
						>
							Increment
						</button>
					</div>
				)}
			</Listener>
		</div>
	);
}
```
