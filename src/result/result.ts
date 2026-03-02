export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

export async function tryCatch<T, E = Error>(
  fn: () => Promise<T>,
  mapError?: (e: unknown) => E,
): Promise<Result<T, E>> {
  try {
    const value = await fn();
    return ok(value);
  } catch (e) {
    if (mapError) {
      return err(mapError(e));
    }
    return err(e as E);
  }
}
