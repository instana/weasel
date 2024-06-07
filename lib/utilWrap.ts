// Define a specific type for the functions
type GenericFunction = (...args: unknown[]) => unknown;

// Define the params that are be added to the shimmer wrapped function
export interface ShimmerWrap extends GenericFunction {
  __wrapped: boolean;
  __unwrap: GenericFunction;
  __original: GenericFunction;
}

export function isWrapped(funk: unknown): funk is ShimmerWrap {
  return (
    typeof funk === 'function' &&
    typeof (funk as ShimmerWrap).__original === 'function' &&
    typeof (funk as ShimmerWrap).__unwrap === 'function' &&
    (funk as ShimmerWrap).__wrapped === true
  );
}
