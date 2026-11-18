# multiListener

The `multiListener` function is the imperative, **non-React counterpart** to the `useMultiListener` hook, designed for subscribing to multiple notifiers simultaneously outside of React component trees.

---

## Overview

When you need to coordinate or react to changes across multiple independent state sources outside of React (such as syncing multiple state slices to a custom persistence layer, running side-effect orchestration, or managing vanilla backend services), hooks cannot be used.

`multiListener` provides a clean, zero-overhead imperative utility. It accepts a readonly tuple array of notifiers, infers their types automatically, invokes the callback immediately with the initial values tuple, and returns a single composite cleanup function.

---

## API Reference

### Import

```tsx
import { multiListener } from "barrex";
```

### Signature

```ts
function multiListener<const T extends readonly Notifier<unknown>[]>(
  notifiers: T,
  callback: ListenerCallback<InferNotifierValues<T>>,
): VoidCallback;
```

### Parameters

| Parameter   | Type                                      | Default      | Description                                                                                                                  |
| ----------- | ----------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `notifiers` | `readonly Notifier<unknown>[]`            | **Required** | A readonly tuple array of source notifiers to subscribe to.                                                                  |
| `callback`  | `(state: InferNotifierValues<T>) => void` | **Required** | A callback function invoked immediately with the value tuple, and subsequently whenever any of the tracked notifiers update. |

### Return Value

- Returns a `VoidCallback` (a composite unsubscribe function `() => void`) that unregisters listeners from all provided notifiers when invoked.

---

## Deep Dive: Core Features & Mechanics

### 1. Automatic Tuple Type Inference (`InferNotifierValues`)

Leveraging TypeScript mapped tuple types, passing an array of notifiers like `[userNotifier, settingsNotifier]` automatically types the state tuple passed into your callback as `[User, Settings]` without any explicit generic casting.

### 2. Eager Initialization

Like its single-notifier counterpart, `multiListener` immediately executes the callback upon registration with the current values of all provided notifiers (`notifiers.map((n) => n.get())`), eliminating the need to manually fetch initial states beforehand.

### 3. Consolidated Teardown

Under the hood, `multiListener` maps over every provided notifier to attach individual subscriptions, then wraps all cleanup handlers into a single unified `unsubscribe` function. Invoking it cleanly strips listeners from every notifier simultaneously, preventing memory leaks.

---

## Usage Examples

### Example 1: Syncing Multiple Global Stores to Local Storage

```ts
import { multiListener } from "barrex";

import { userNotifier, preferencesNotifier } from "./notifiers";

// Subscribe to multiple independent notifiers outside of React
const unsubscribe = multiListener(
  [userNotifier, preferencesNotifier],
  ([user, prefs]) => {
    const sessionPayload = {
      userId: user.id,
      theme: prefs.theme,
      language: prefs.language,
    };
    localStorage.setItem("app_session", JSON.stringify(sessionPayload));
  },
);

// When terminating or tearing down the service:
// unsubscribe();
```

### Example 2: Cross-Store Analytics / Side-Effect Logging

```ts
import { multiListener } from "barrex";

import { cartNotifier, authNotifier } from "./notifiers";

// Track cart updates alongside authentication state for telemetry
const unsubscribe = multiListener(
  [cartNotifier, authNotifier],
  ([cart, auth]) => {
    if (auth.isLoggedIn) {
      console.log(
        `Telemetry: User ${auth.email} cart now has ${cart.items.length} items.`,
      );
    }
  },
);
```
