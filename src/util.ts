export function assertUnreachable(_: never): never {
  throw new Error('This function should not be called');
}
