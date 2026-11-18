# useListener

The `useListener` hook is the core primitive in `barrex` for subscribing React function components to notifiers, enabling precise, fine-grained reactivity.

---

## Overview

Powered natively by React's `useSyncExternalStore`, `useListener` connects a component directly to a `barrex` notifier. Instead of re-rendering an entire component tree when any property changes, `useListener` ensures components only re-render when the exact state slice they care about updates.

It also provides built-in support for memoized data transformation via selectors and referential stability preservation via custom state comparators.

---

## API Reference

### Import

```tsx
import { useListener } from "barrex";
```

### Signature

```ts
function useListener<T, U = T>(
  notifier: Notifier<T>,
  selector?: StateSelector<T, U>,
  areStatesEqual?: StatesComparer<U>,
): U;
```

### Parameters

| Parameter        | Type                            | Default      | Description                                                                                           |
| ---------------- | ------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------- |
| `notifier`       | `Notifier<T>`                   | **Required** | The source notifier instance to subscribe to.                                                         |
| `selector`       | `(state: T) => U`               | `undefined`  | Optional function to transform or compute a specific slice from the notifier state.                   |
| `areStatesEqual` | `(prev: U, next: U) => boolean` | `undefined`  | Optional custom comparer. Returns `true` to reuse the previous state reference and skip re-rendering. |

---

## Deep Dive: Core Features & Mechanics

### 1. Granular Subscriptions

By calling `useListener(notifier)`, your component establishes a direct subscription to the notifier's value. The component will automatically queue a re-render _only_ when that specific notifier emits an update.

### 2. State Transformation via Selectors

If you only need a portion of a larger state object, passing a `selector` function prevents your component from re-rendering when unrelated parts of the state change:

```ts
// Component only updates when `name` changes, ignoring other user properties
const name = useListener(userNotifier.profile, (state) => state.name);
```

### 3. Referential Stability & Custom Comparators (`areStatesEqual`)

When computing derived states or structural subsets, new object references can sometimes be generated on every read, accidentally triggering downstream component re-renders.

`useListener` tracks the previous state using an internal `useRef`. If an `areStatesEqual` function is provided, it evaluates `prev` and `next` states:

- If `areStatesEqual` returns `true`, the hook **reusing the exact previous state reference** (`prevState.current`) and aborts the component re-render.
- If it returns `false`, it accepts the new state.

### 4. Concurrent Mode & SSR Safety

Because it is built on top of `useSyncExternalStore`, `useListener` is fully compatible with React Concurrent Rendering, Suspense, and Server-Side Rendering (SSR) out of the box, handling client-server snapshot synchronization seamlessly.

---

## Usage Examples

### Example 1: Basic Reactive Counter

```tsx
import { useListener } from "barrex";

import { counterNotifier } from "./counter-notifier";

export function CounterView() {
  // Subscribes directly to the counter value
  const count = useListener(counterNotifier);

  return (
    <div>
      <span>Count: {count}</span>
      <button onClick={() => counterNotifier.set((c) => c + 1)}>+</button>
    </div>
  );
}
```

### Example 2: Advanced Usage with Selector and Equality Guard

This example demonstrates mapping a large state object down to an array of active filters and using a custom comparator to avoid re-renders when the array contents remain structurally identical.

```tsx
import { useListener } from "barrex";

import { filterNotifier } from "./filter-notifier";

export function FilterTags() {
  // Extract tag list using a selector
  const tags = useListener(
    filterNotifier,
    (state) => state.activeTags,
    // Custom equality guard: check if tag IDs match to prevent unnecessary re-renders
    (prev, next) =>
      prev.length === next.length &&
      prev.every((tag, i) => tag.id === next[i].id),
  );

  return (
    <div className="tag-list">
      {tags.map((tag) => (
        <span key={tag.id} className="tag">
          {tag.label}
        </span>
      ))}
    </div>
  );
}
```
