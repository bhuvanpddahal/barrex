# IsolatedContainer

The `IsolatedContainer` is a boundary component designed to completely shield its child subtree from parent-driven re-renders.

---

## Overview

In React's rendering model, when a parent component re-renders, all of its children and descendants re-render by default—even if their props remain unchanged. In deep component trees or high-frequency update scenarios (such as typing in a form input or tracking mouse coordinates), this cascading re-render behavior can introduce performance bottlenecks.

`IsolatedContainer` solves this by acting as a rigid performance firewall. By utilizing a custom `React.memo` comparator that always returns `true`, it guarantees that **parent-driven re-render cascades will never cross the boundary**.

---

## Key Characteristics

- **Parent Isolation:** Parent re-renders do not affect the wrapped subtree.
- **Autonomous Reactivity:** Children inside an `IsolatedContainer` are not trapped; they can still re-render independently based on their own local state or external reactive bindings (such as `barrex` notifiers via `useListener`).
- **Zero-Magic API:** Implemented using standard React primitives with zero hidden overhead.

---

## API Reference

### Import

```tsx
import { IsolatedContainer } from "barrex";
```

### Props

| Prop       | Type              | Description                                                      |
| ---------- | ----------------- | ---------------------------------------------------------------- |
| `children` | `React.ReactNode` | The component subtree to isolate from parent re-render cascades. |

---

## When to Use `IsolatedContainer`

Beyond general rendering optimization, `IsolatedContainer` is particularly useful in several architectural scenarios:

### 1. High-Frequency Parent Updates

If a parent component handles rapid state changes (e.g., window resizing, scroll positions, or live text inputs), wrapping static or expensive child subtrees in an `IsolatedContainer` prevents them from being dragged down by the parent's update frequency.

### 2. Complex Visualizations or Heavy Subtrees

When rendering complex data grids, charts, or dense UI blocks that take noticeable time to compute and paint, isolating them ensures that unrelated state updates higher up in the layout tree leave the heavy component untouched.

### 3. Decoupling Global Layouts from Local Widgets

If you have a global layout component that frequently re-renders due to route changes or user session updates, but contains independent widgets managed by fine-grained state (like `barrex` notifiers), `IsolatedContainer` ensures those widgets only update when their specific state changes.

---

## ⚠️ Important Caveat: Prop Staleness & Referential Stability

Because `IsolatedContainer` forces `React.memo` to always return `true`, **it blocks all prop updates originating from the parent component**.

- **The Risk:** If the components passed as children accept dynamic props from their parent, **they will not receive updated prop values** when the parent changes them. The child subtree will remain frozen with the exact props it received upon initial mount.
- **The Exception:** It is only safe to pass props through an `IsolatedContainer` if those props possess **strict referential stability** (such as notifiers, static configuration objects, immutable constants, or memoized callbacks that never change reference).
- **Recommended Pattern:** If a component needs to react to changing data, avoid passing it via parent props through an `IsolatedContainer`. Instead, decouple it entirely by having the child consume data reactively using `barrex` notifiers (e.g., `useListener`), ensuring it updates independently of parent prop flow.

---

## Usage Example

```tsx
import { useState } from "react";
import { IsolatedContainer, useListener } from "barrex";

import { counterNotifier } from "./counter-notifier";

// A static component that should never re-render when the parent types
function StaticHeader() {
  console.log("StaticHeader rendered!"); // Will only run once on mount
  return <h2>Dashboard Overview</h2>;
}

// A reactive component that listens directly to a barrex notifier
function CounterWidget() {
  const count = useListener(counterNotifier);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => counterNotifier.set((c) => c + 1)}>+</button>
    </div>
  );
}

export function Dashboard() {
  const [text, setText] = useState("");

  return (
    <div style={{ padding: "20px" }}>
      {/* Typing here causes Dashboard to re-render, but StaticHeader and CounterWidget are shielded */}
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type to trigger parent re-render..."
      />

      <IsolatedContainer>
        <StaticHeader />
        <CounterWidget />
      </IsolatedContainer>
    </div>
  );
}
```
