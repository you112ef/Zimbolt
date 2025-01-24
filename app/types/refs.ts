// app/types/refs.ts

/**
 * A simple interface matching React.RefObject<T> shape.
 * We define our own so that we don't rely on React's named export.
 */
export interface RefObject<T> {
  current: T | null;
}

/**
 * A generic callback ref type for storing or cleaning up DOM references.
 */
export type RefCallback<T> = (instance: T | null) => void;
