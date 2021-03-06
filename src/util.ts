export function assertUnreachable(_: never): never {
  throw new Error('This function should not be called');
}

export function onlyUnique<T>(v: T, i: number, self: T[]) {
  return self.indexOf(v) === i;
}

export function intersection<T>(a1: T[], a2: T[]) {
  return a1.filter((v) => a2.indexOf(v) !== -1);
}
