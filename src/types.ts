import type { JSX, ReactNode } from "react";

export type NodeKey = string | symbol;

/**
 * The core methods available on every notifier node in the `barrex` tree.
 */
type BaseNotifier<T> = {
    /** Retrieves the current value of the notifier state. */
    get(): T;

    /** Updates the notifier state with a new value or an updater function, returning true if updated. */
    set(state: SetState<T>): boolean;

    /** Subscribes a listener callback to state updates, returning an unsubscribe function. */
    subscribe(listener: VoidCallback): VoidCallback;
};

/**
 * Conditionally maps properties or array indices into nested sub-notifiers, 
 * while preserving functions as methods.
 */
type NotifierNode<T> = (
    [T] extends [Array<any>]
    ? {
        // Allow only numeric / tuple index access, stripping all array prototype methods & length
        [K in Extract<keyof T, number | `${number}`>]: T[K] extends Function ? T[K] : Notifier<T[K]>;
    }
    : [T] extends [object]
    ? { [K in keyof T]: T[K] extends Function ? T[K] : Notifier<T[K]> }
    : object
) & BaseNotifier<T>;

/**
 * Represents a deeply reactive proxy container wrapping state of type `T`.
 * Every nested property automatically becomes a sub-notifier. Raw functions cannot be notifiers.
 */
export type Notifier<T> = ([T] extends [Function]
    ? never
    : NotifierNode<T>) & {};

/** Helper type to detect if T is explicitly `any` */
export type IsAny<T> = 0 extends (1 & T) ? true : false;

/**
 * Shared base props for declarative listener components.
 */
interface BaseListenerProps {
    /** A pre-rendered element passed to the render function that is insulated from state updates. */
    stableChild?: JSX.Element;

    /**
     * When true, prevents the component from re-rendering when its parent component re-renders.
     * @default false
    */
    isolated?: boolean;
}

/**
 * Props for the single `Listener` component wrapper.
 */
export interface ListenerProps<T, U = T> extends BaseListenerProps {
    /** The source notifier instance to listen to. */
    notifier: Notifier<T>;

    /** Optional function to transform or compute a specific slice from the notifier state. */
    selector?: StateSelector<T, U>;

    /** Optional custom comparer. Returns true to skip re-rendering when states are equal. */
    areStatesEqual?: StatesComparer<U>;

    /** A render-prop function receiving the reactive state and optional stableChild. */
    children: ChildrenRenderer<U>;
}

/**
 * Props for the `MultiListener` component.
 */
export type MultiListenerProps<
    T extends readonly Notifier<unknown>[], U = InferNotifierValues<T>
> = MultiListenerWithSelectorProps<T, U> | MultiListenerWithoutSelectorProps<T>;

/**
 * Props for the `MultiListener` component when utilizing a selector transformation.
 */
export interface MultiListenerWithSelectorProps<
    T extends readonly Notifier<unknown>[],
    U
> extends BaseListenerProps {
    /** A readonly tuple array of source notifiers to listen to. */
    notifiers: T;

    /** Function to transform or combine the tuple values into a custom shape U. */
    selector: StateSelector<InferNotifierValues<T>, U>;

    /**
     * Optional custom comparer. Returns true to skip re-rendering when states are equal.
     * Defaults to a smart tuple-aware shallow equality checker.
    */
    areStatesEqual?: StatesComparer<U>;

    /** A render-prop function receiving the resolved selector state and optional stableChild. */
    children: ChildrenRenderer<U>;
}

/**
 * Props for the `MultiListener` component without a selector (supplies raw values tuple).
 */
export interface MultiListenerWithoutSelectorProps<
    T extends readonly Notifier<unknown>[]
> extends BaseListenerProps {
    /** A readonly tuple array of source notifiers to listen to. */
    notifiers: T;

    selector?: undefined;

    /** Optional custom comparer for the state tuple. Defaults to a smart tuple-aware shallow equality checker. */
    areStatesEqual?: StatesComparer<InferNotifierValues<T>>;

    /** A render-prop function receiving the resolved state tuple and optional stableChild. */
    children: ChildrenRenderer<InferNotifierValues<T>>;
}

/**
 * Overloaded component interface for `MultiListener` supporting both tuple and selector patterns.
 */
export interface MultiListenerComponent {
    <const T extends readonly Notifier<unknown>[], const U>(
        props: MultiListenerWithSelectorProps<T, U>
    ): ReactNode;
    <const T extends readonly Notifier<unknown>[]>(
        props: MultiListenerWithoutSelectorProps<T>
    ): ReactNode;
}

/**
 * Props for the `IsolatedContainer` performance boundary component.
 */
export interface IsolatedContainerProps {
    children: ReactNode;
}

/** A standard callback function returning no value. */
export type VoidCallback = () => void;

/** A callback function receiving a state update of type `T`. */
export type ListenerCallback<T> = (state: T) => void;

/** A function returning an initial state value. */
export type StateInitializer<T> = () => T;

/** A function taking previous state and returning new state. */
export type StateUpdater<T> = (prevState: T) => T;

/** A function selecting or transforming state from `T` to `U`. */
export type StateSelector<T, U> = (state: T) => U;

/** A comparison function returning true if previous and next states are equal. */
export type StatesComparer<T> = (prevState: T, nextState: T) => boolean;

/** Accepts either a raw state value or an updater function. */
export type SetState<T> = T | StateUpdater<T>;

/** Initial state value or a lazy initializer function (excluding functions as root state). */
export type InitialState<T> = (T extends Function ? never : (T | StateInitializer<T>)) & {};

/** A render-prop function signature for rendering reactive components. */
export type ChildrenRenderer<T> = (state: T, stableChild?: JSX.Element) => ReactNode;

/** Helper type to extract the underlying value type T from a Notifier<T>. */
export type InferNotifierValue<N> = N extends Notifier<infer T> ? T : never;

/** Mapped tuple type to transform `[Notifier<A>, Notifier<B>]` into `[A, B]`. */
export type InferNotifierValues<T extends readonly Notifier<unknown>[]> = {
    [K in keyof T]: InferNotifierValue<T[K]>;
};