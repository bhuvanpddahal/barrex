import type {
    NodeKey,
    SetState,
    StateUpdater,
    VoidCallback
} from "./types";
import { isArray, isFunction, isObjectOrArray } from "./utils/helpers";

export class NotifierRoot {
    public state: unknown;
    public rootNode: RootNode;

    constructor(state: unknown) {
        this.state = state;
        this.rootNode = new RootNode(this);
    }
}

abstract class Node {
    protected cachedState: unknown;
    private listeners: Set<VoidCallback>;
    private children: Map<NodeKey, ChildNode>;
    public proxy: object;

    constructor() {
        this.cachedState = null;
        this.listeners = new Set();
        this.children = new Map();
        this.proxy = this.createProxy();
    }

    public abstract get(): unknown;
    public abstract set(state: SetState<unknown>, fromChild: boolean): boolean;

    public dispatchSet = (state: SetState<unknown>) => {
        return this.set(state, false);
    };

    private subscribe = (callback: VoidCallback) => {
        this.listeners.add(callback);
        return () => {
            this.listeners.delete(callback);
        };
    };

    protected notifyListeners() {
        this.listeners.forEach((listener) => listener());
    }

    private notifySubtree() {
        this.cachedState = null;
        this.notifyListeners();
        for (const child of this.children.values()) {
            child.notifySubtree();
        }
    }

    protected reconcileChildren(prevState: unknown, newState: unknown) {
        if (!isArray(prevState) || !isArray(newState)) {
            return;
        }
        for (const [key, child] of this.children) {
            const index = key as `${number}`;
            const prevChildState = prevState[index];
            const newChildState = newState[index];
            if (newChildState !== prevChildState) {
                child.notifySubtree();
            }
        }
    }

    private setTrap() { return false; }

    private createProxy() {
        return new Proxy(
            {},
            {
                get: (_, prop) => {
                    if (prop === "get") return this.get;
                    if (prop === "set") return this.dispatchSet;
                    if (prop === "subscribe") return this.subscribe;

                    const state = this.get();
                    if (isObjectOrArray(state) && prop in state) {
                        const value = (state as any)[prop];
                        if (isFunction(value)) return value;

                        let childNode = this.children.get(prop);
                        if (!childNode) {
                            childNode = new ChildNode(prop, this);
                            this.children.set(prop, childNode);
                        }
                        return childNode.proxy;
                    }
                },
                set: this.setTrap
            }
        );
    }
}

class RootNode extends Node {
    private root: NotifierRoot;

    constructor(root: NotifierRoot) {
        super();
        this.root = root;
    }

    public get = () => this.root.state;

    public set(state: SetState<unknown>, fromChild: boolean) {
        const prevState = this.get();
        const newState = isFunction(state)
            ? (state as StateUpdater<unknown>)(prevState)
            : state;
        if (newState !== prevState) {
            this.root.state = newState;
            this.notifyListeners();
            if (!fromChild) {
                this.reconcileChildren(prevState, newState);
            }
            return true;
        }
        return false;
    }
}

class ChildNode extends Node {
    private key: NodeKey;
    private parent: Node;

    constructor(key: NodeKey, parent: Node) {
        super();
        this.key = key;
        this.parent = parent;
    }

    public get = (): unknown => {
        if (this.cachedState !== null) {
            return this.cachedState;
        }
        const state = (this.parent.get() as any)[this.key];
        this.cachedState = state;
        return state;
    }

    public set(state: SetState<unknown>, fromChild: boolean) {
        const parentState = this.parent.get();
        const prevState = (parentState as any)[this.key];
        const newState = isFunction(state)
            ? (state as StateUpdater<unknown>)(prevState)
            : state;
        if (newState !== prevState) {
            const newParentState = Object.assign(
                isArray(parentState) ? [] : {},
                parentState
            );
            (newParentState as any)[this.key] = newState;
            const isSet = this.parent.set(newParentState, true);
            if (isSet) {
                this.cachedState = newState;
                this.notifyListeners();
                if (!fromChild) {
                    this.reconcileChildren(prevState, newState);
                }
                return true;
            }
            return false;
        }
        return false;
    }
}