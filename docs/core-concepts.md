## Core Concepts

Understanding how `barrex` manages state comes down to two primary primitives: **Notifiers** and **Listeners**.

### 1. Notifiers (The Source of Truth)

A notifier wraps any valid value into an observable, fully-typed proxy node.

- **The Rule:** Any value can be a notifier (**primitives, objects, arrays, etc.**), _except_ functions. JavaScript functions cannot be stored as notifiers.
- **Global vs. Local:** Depending on where your state lives, `barrex` provides two distinct creation patterns:
  - [`notifier`](./utils/notifier.md): Designed to be used **outside of React**. Perfect for global state stores, services, or cross-module state management.
  - [`useNotifier`](./hooks/use-notifier.md): Designed to be used **inside React components**. Ideal for local states that belong strictly to a single page or a small subtree of components.

### 2. Listeners (Fine-Grained Reactivity)

Listeners consume notifiers to achieve precise, fine-grained reactivity. Instead of re-rendering an entire component tree when any property changes, listeners ensure that components or subscriber functions only re-render when the exact state slice they care about updates.

Listeners are split into two structural types, each available as a **React component**, a **React hook**, and an **imperative function**:

- **Single Listeners:** Track and consume a single notifier node.
  - [`Listener`](./components/listener.md): Declarative React component that confines re-renders strictly to its render-prop subtree.
  - [`useListener`](./hooks/use-listener.md): React hook that subscribes a component to a notifier.
  - [`listener`](./utils/listener.md): Imperative function version for non-React contexts.
- **Multi Listeners:** Coordinate and track multiple notifiers simultaneously.
  - [`MultiListener`](./components/multi-listener.md): Declarative React component for subscribing to multiple notifiers inline with tuple type safety.
  - [`useMultiListener`](./hooks/use-multi-listener.md): React hook for combining several notifiers in a single component.
  - [`multiListener`](./utils/multi-listener.md): Imperative function version for batch or multi-source subscriptions.
