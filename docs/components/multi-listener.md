# MultiListener

The `MultiListener` is an advanced declarative component wrapper that enables fine-grained subscriptions to **multiple notifiers simultaneously**. It serves as the component-based counterpart to the `useMultiListener` hook.

---

## Overview

When a UI widget or section needs to derive its view from multiple independent state sources, listening to them separately can lead to fragmented component trees or boilerplate coordination code.

`MultiListener` accepts an array (tuple) of notifiers, tracks all of them concurrently, and provides **strict end-to-end TypeScript safety** over the combined state tuple passed to its children render-prop. It also features built-in array/tuple structural comparison and performance isolation controls.

---

## API Reference

### Import

```tsx
import { MultiListener } from "barrex";
```

### Props (`MultiListenerWithSelectorProps` / `MultiListenerWithoutSelectorProps`)

| Prop             | Type                                                 | Default               | Description                                                                                                 |
| ---------------- | ---------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------- |
| `notifiers`      | `readonly Notifier<unknown>[]`                       | **Required**          | A readonly tuple array of source notifiers to listen to.                                                    |
| `selector`       | `(values: InferNotifierValues<T>) => U`              | `undefined`           | Optional function to transform or combine the tuple values into a custom shape `U`.                         |
| `areStatesEqual` | `StatesComparer<U>`                                  | _Smart Tuple Default_ | Optional custom comparer. Returns `true` to skip re-rendering when states are equal.                        |
| `stableChild`    | `JSX.Element`                                        | `undefined`           | A pre-rendered element passed to the render function that is insulated from state update re-renders.        |
| `isolated`       | `boolean`                                            | `false`               | When `true`, prevents the `MultiListener` component from re-rendering when its parent component re-renders. |
| `children`       | `(state: U, stableChild?: JSX.Element) => ReactNode` | **Required**          | A render-prop function receiving the resolved state and optional `stableChild`.                             |

---

## Deep Dive: Core Features & Mechanics

### 1. Automatic Tuple Inference & Type Safety

`MultiListener` utilizes advanced TypeScript mapped tuple types (`InferNotifierValues`). When you pass an array of notifiers like `[userNotifier, cartNotifier]`, TypeScript automatically infers the exact tuple type `[User, Cart]` for your render-prop parameters **without requiring manual type casting or generic definitions**.

### 2. Smart Tuple Equality Checking

When listening to multiple notifiers without a selector, the default state represents a fresh array of values on every check. Without special handling, this would trigger unnecessary re-renders due to reference changes.

`barrex` solves this with a built-in smart equality helper that automatically inspects array lengths and shallow-compares element values item-by-item (`prevValue === nextValue`). If all individual notifier values match their previous values, re-rendering is safely skipped.

### 3. Combining with Selectors

If you want to compute a single derived value or run business logic across multiple notifiers (e.g., calculating a total cart price including tax), you can supply a `selector` function. The component will only re-render when the final computed output of the selector changes.

### 4. Performance Firewalling (`isolated` + `stableChild`)

Just like `Listener`, `MultiListener` supports the `isolated` prop. Because `barrex` notifiers are stable reference objects, setting `isolated={true}` blocks all parent-driven re-render cascades, ensuring the component updates **only** when one of its tracked notifiers actually changes.

---

## Usage Examples

### Example 1: Combining Multiple Notifiers (Tuple Destructuring)

```tsx
import { MultiListener } from "barrex";

import { userNotifier, cartNotifier } from "./notifiers";

export function UserCartSummary() {
  return (
    <MultiListener notifiers={[userNotifier, cartNotifier]}>
      {([user, cart]) => (
        <div>
          <p>Welcome, {user.name}</p>
          <p>Items in cart: {cart.itemCount}</p>
        </div>
      )}
    </MultiListener>
  );
}
```

### Example 2: Using a Selector and Performance Isolation (`isolated`)

This example demonstrates combining multiple state sources into a single derived boolean and isolating the component from parent re-renders.

```tsx
import { useState } from "react";
import { MultiListener } from "barrex";

import { authNotifier, permissionsNotifier } from "./notifiers";

const StaticLockIcon = <span className="lock-icon">🔒</span>;

export function AdminPanel() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="layout">
      <button onClick={() => setSidebarOpen(!sidebarOpen)}>
        Toggle Sidebar (Parent Update)
      </button>

      {/* MultiListener only re-renders if auth state or permissions change. 
      Sidebar toggles on the parent will not trigger a re-render here. */}
      <MultiListener
        notifiers={[authNotifier, permissionsNotifier]}
        isolated={true}
        selector={([auth, permissions]) => {
          return auth.isAuthenticated && permissions.roles.includes("admin");
        }}
        stableChild={StaticLockIcon}
      >
        {(isAdmin, stableChild) => (
          <div className="admin-widget">
            {stableChild}
            {isAdmin ? (
              <button>Open Admin Dashboard</button>
            ) : (
              <p>Access Denied</p>
            )}
          </div>
        )}
      </MultiListener>
    </div>
  );
}
```
