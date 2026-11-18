# notifier

The `notifier` function is the core primitive in `barrex` for creating global, root-level state containers **outside of React component trees**.

---

## Overview

Designed as the primary entry point for global store initialization, `notifier` wraps any valid JavaScript value or object into a deeply reactive, fully-typed proxy tree.

It acts as the single source of truth for your application state, allowing non-React services, vanilla utility functions, and React hooks (via `useListener` or `Listener`) to observe and mutate state predictably.

---

## API Reference

### Import

```tsx
import { notifier } from "barrex";
```

### Signature

```ts
function notifier<T>(initialState: InitialState<T>): Notifier<T>;
```

### Parameters

| Parameter      | Type             | Default      | Description                                                                                       |
| -------------- | ---------------- | ------------ | ------------------------------------------------------------------------------------------------- |
| `initialState` | `T \| (() => T)` | **Required** | The initial value of the state, or a lazy initialization function that returns the initial state. |

### Return Value

- Returns a `Notifier<T>` proxy instance representing the root of the state tree.

---

## Deep Dive: Core Features & Mechanics

### 1. Lazy Initialization Support

You can pass either a direct value or a lazy initializer function (e.g., `() => computeInitialState()`) as the argument. If a function is passed, `notifier` will execute it once upon creation to resolve the initial state value.

### 2. The Function Restriction Guard

A core design tenet of `barrex` is that **raw functions cannot be notifiers**.

- If the resolved state evaluates to a function at the root level, `notifier` will throw an error:

  > `"A function cannot be a notifier. Replace it with other value, or add it as a property/method inside an object, or don't wrap it with notifier."`

- **The Exception:** Functions _are_ fully supported and safely preserved when they reside as properties or methods inside an object (e.g., helper actions or methods attached to your state object).

### 3. Automatic Proxy Tree Generation

Thanks to the underlying proxy architecture, every nested property inside your initial state object automatically becomes a sub-notifier. This enables fine-grained tracking of deep data branches without extra boilerplate.

---

## Usage Examples

### Example 1: Global Application Store

```ts
import { notifier } from "barrex";

interface AuthState {
  user: {
    name: string;
    email: string;
  } | null;
  isAuthenticated: boolean;
}

// Create and export a global notifier instance
export const authNotifier = notifier<AuthState>({
  user: null,
  isAuthenticated: false,
});
```

### Example 2: Using Lazy Initializers & Methods

```ts
import { notifier } from "barrex";

type Theme = "light" | "dark";

interface SettingsState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

// Lazy initialization pattern with action methods included
export const settingsNotifier = notifier<SettingsState>(() => {
  const savedTheme = (localStorage.getItem("theme") as Theme) || "light";

  return {
    theme: savedTheme,
    setTheme: (newTheme) => settingsNotifier.theme.set(newTheme),
  };
});
```
