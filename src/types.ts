import type { JSX, ReactNode } from "react";

export type NodeKey = string | symbol;

// The core methods available on every notifier node
type BaseNotifier<T> = {
    get(): T;
    set(state: SetState<T>): boolean;
    subscribe(listener: VoidCallback): VoidCallback;
};

// Conditionally map keys ONLY if T is an object/array (wrapped in tuples to prevent union distribution)
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

// Exclude functions from being notifiers (using [T] to prevent distribution)
export type Notifier<T> = ([T] extends [Function]
    ? never
    : NotifierNode<T>) & {};

// Helper type to detect if T is explicitly `any`
export type IsAny<T> = 0 extends (1 & T) ? true : false;

interface BaseListenerProps {
    stableChild?: JSX.Element;
    isolated?: boolean;
}

export interface ListenerProps<T, U = T> extends BaseListenerProps {
    notifier: Notifier<T>;
    selector?: StateSelector<T, U>;
    areStatesEqual?: StatesComparer<U>;
    children: ChildrenRenderer<U>;
}

export type MultiListenerProps<
    T extends readonly Notifier<unknown>[], U = InferNotifierValues<T>
> = MultiListenerWithSelectorProps<T, U> | MultiListenerWithoutSelectorProps<T>;

export interface MultiListenerWithSelectorProps<
    T extends readonly Notifier<unknown>[],
    U
> extends BaseListenerProps {
    notifiers: T;
    selector: StateSelector<InferNotifierValues<T>, U>;
    areStatesEqual?: StatesComparer<U>;
    children: ChildrenRenderer<U>;
}

export interface MultiListenerWithoutSelectorProps<
    T extends readonly Notifier<unknown>[]
> extends BaseListenerProps {
    notifiers: T;
    selector?: undefined;
    areStatesEqual?: StatesComparer<InferNotifierValues<T>>;
    children: ChildrenRenderer<InferNotifierValues<T>>;
}

export interface MultiListenerComponent {
    <const T extends readonly Notifier<unknown>[], const U>(
        props: MultiListenerWithSelectorProps<T, U>
    ): ReactNode;
    <const T extends readonly Notifier<unknown>[]>(
        props: MultiListenerWithoutSelectorProps<T>
    ): ReactNode;
}

export interface IsolatedContainerProps {
    children: ReactNode;
}

export type VoidCallback = () => void;
export type ListenerCallback<T> = (state: T) => void;
export type StateInitializer<T> = () => T;
export type StateUpdater<T> = (prevState: T) => T;
export type StateSelector<T, U> = (state: T) => U;
export type StatesComparer<T> = (prevState: T, nextState: T) => boolean;
export type SetState<T> = T | StateUpdater<T>;
export type InitialState<T> = (T extends Function ? never : (T | StateInitializer<T>)) & {};
export type ChildrenRenderer<T> = (state: T, stableChild?: JSX.Element) => ReactNode;

// Helper type to extract the underlying value type T from a Notifier<T>
export type InferNotifierValue<N> = N extends Notifier<infer T> ? T : never;

// Mapped tuple type to transform [Notifier<A>, Notifier<B>] into [A, B]
export type InferNotifierValues<T extends readonly Notifier<unknown>[]> = {
    [K in keyof T]: InferNotifierValue<T[K]>;
};