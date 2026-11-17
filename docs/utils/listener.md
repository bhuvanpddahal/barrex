# listener

The `listener` function is the imperative, **non-React counterpart** to the `useListener` hook, designed for subscribing to notifiers outside of React component trees.

---

## Overview

In architectural scenarios where state updates need to drive side effects, logging, local storage sync, network requests, or vanilla DOM mutations outside of React, components and hooks cannot be used.

The `listener` function provides a clean, zero-overhead subscription utility. It attaches to any `barrex` notifier, immediately fires with the current value, and returns a standard cleanup/unsubscribe function.

---

## API Reference

### Import

```tsx
import { listener } from "barrex";
```

### Signature

```ts
function listener<T>(
	notifier: Notifier<T>,
	callback: ListenerCallback<T>
): VoidCallback;
```

### Parameters

| Parameter  | Type                 | Default      | Description                                                                                            |
| ---------- | -------------------- | ------------ | ------------------------------------------------------------------------------------------------------ |
| `notifier` | `Notifier<T>`        | **Required** | The source notifier instance to subscribe to.                                                          |
| `callback` | `(state: T) => void` | **Required** | A callback function invoked immediately upon binding and subsequently every time the notifier updates. |

### Return Value

- Returns a `VoidCallback` (an unsubscribe function `() => void`) that removes the listener when invoked.

---

## Deep Dive: Core Features & Mechanics

### 1. Immediate Execution (Eager Initialization)

`listener` **immediately executes the callback upon registration** using `notifier.get()`. This eliminates the common boilerplate of having to manually fetch initial state before setting up a subscription.

### 2. Clean Teardown Mechanism

Because it returns a standard cleanup function, managing subscriptions in non-React environments (like class instances, event listeners, or application bootstrap files) is clean and leak-free.

### 3. Framework-Agnostic Utility

Because it has no dependency on React fibers or hooks, `listener` can run anywhere JavaScript runs—including Node.js backends, vanilla script tags, web workers, or test suites.

---

## Usage Examples

### Example 1: Logging State Changes in a Service

```ts
import { listener } from "barrex";
import { authNotifier } from "./store";

// Subscribe to authentication state globally outside of React
const unsubscribe = listener(authNotifier, (auth) => {
	if (auth.isLoggedIn) {
		console.log(`User logged in: ${auth.user.email}`);
	} else {
		console.log("User logged out.");
	}
});

// Later, when tearing down the service or shutting down:
// unsubscribe();
```

### Example 2: Synchronizing State to Local Storage

```ts
import { listener } from "barrex";
import { themeNotifier } from "./store";

// Automatically persist user theme preference whenever it changes
const unsubscribe = listener(themeNotifier, (theme) => {
	localStorage.setItem("app_theme", theme);
	document.documentElement.className = theme;
});
```
