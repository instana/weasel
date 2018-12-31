declare var DEBUG: bool;

declare type ErrorLike = {
  message: string,
  stack: ?string,

  // to permit ['foo'] based access that doesn't break
  // when pushed through the Closure compiler
  [key: string]: ?number|?string
}
