# useNotifier

The `useNotifier` hook is the primary primitive in `barrex` for creating **local, component-scoped notifiers** with automatic proxy-driven nested reactivity.

---

## Overview

While `notifier` is designed for global stores outside of React, `useNotifier` is tailored for state that belongs strictly to a single component, page, or local subtree.

Powered by React's lazy `useState` initialization, it guarantees that your root notifier instance is created exactly once upon mount and maintains a stable reference throughout the component's lifecycle. Thanks to `barrex`'s proxy-driven architecture, every nested property on your initial state automatically becomes a first-class notifier itself.

---

## API Reference

### Import

```tsx
import { useNotifier } from "barrex";
```

### Signature

```ts
function useNotifier<T>(initialState: InitialState<T>): Notifier<T>;
```

### Parameters

| Parameter      | Type              | Default      | Description                                                                                            |
| -------------- | ----------------- | ------------ | ------------------------------------------------------------------------------------------------------ |
| `initialState` | `InitialState<T>` | **Required** | The initial shape of your local state object, primitives, or collections. Can include methods/actions. |

---

## Deep Dive: Core Features & Mechanics

### 1. Local State Scope

`useNotifier` is ideal for managing complex local component state (such as form inputs, multi-step wizards, or local UI toggles) without needing bulky `useState` or `useReducer` boilerplate. Because it lives inside the component, its lifecycle is tied directly to that component instance.

### 2. Automatic Nested Notifiers (Proxy Architecture)

When you initialize `useNotifier`, `barrex` wraps your state in a recursive proxy. **Every property within your state object automatically becomes a sub-notifier.**

- If you pass `{ name: "Alice", age: 40 }`, then `notifier.name` and `notifier.age` are valid, independent notifiers.
- These nested notifiers can be passed directly into `useListener` or `Listener` to achieve extreme fine-grained reactivity.

### 3. Function Exemption (Actions & Methods)

Functions cannot be notifiers. If you include methods inside your initial state object (such as updater helpers or event handlers), `barrex` intelligently leaves them as plain JavaScript functions. They are safely preserved on the root object without triggering proxy wrapping errors.

### 4. Referential Stability

Underlying notifier is never re-allocated or re-created on subsequent component re-renders, preventing memory leaks and broken subscription lifecycles.

---

## Usage Examples

### Example 1: Local Form State with Nested Subscriptions

This example demonstrates managing a local user object where individual fields act as separate notifiers.

```tsx
import { Listener, useNotifier, useListener } from "barrex";

export function UserProfileCard() {
  // Create a local notifier bound to this component instance
  const userNotifier = useNotifier({
    name: "Alice",
    age: 40,
    country: "US",
    // Methods are supported and ignored by the proxy system
    updateName: (newName: string) => userNotifier.name.set(newName),
  });

  return (
    <div className="card">
      <h2>
        <Listener notifier={userNotifier.name}>{(name) => name}</Listener>{" "}
        <Listener notifier={userNotifier.age}>{(age) => `(${age})`}</Listener>
      </h2>

      {/* Direct mutation via .set() on the property notifier */}
      <button onClick={() => userNotifier.age.set((a) => a + 1)}>
        Increment Age
      </button>

      {/* Calling the defined action method */}
      <button onClick={() => userNotifier.updateName("Bob")}>
        Change Name to Bob
      </button>
    </div>
  );
}
```
