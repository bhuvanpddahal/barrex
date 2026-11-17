export function isObjectOrArray(value: unknown): value is object {
    return typeof value === "object" && value !== null;
}

export function isArray(value: unknown): value is Array<unknown> {
    return Array.isArray(value);
}

export function isFunction(value: unknown): value is Function {
    return typeof value === "function";
}