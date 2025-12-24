/**
 * Result type for functional error handling
 * Based on Railway Oriented Programming pattern
 */

export type Result<T, E = Error> = Success<T> | Failure<E>;

export interface Success<T> {
  readonly success: true;
  readonly value: T;
}

export interface Failure<E> {
  readonly success: false;
  readonly error: E;
}

/**
 * Creates a successful Result
 */
export const ok = <T>(value: T): Success<T> => ({
  success: true,
  value,
});

/**
 * Creates a failed Result
 */
export const fail = <E>(error: E): Failure<E> => ({
  success: false,
  error,
});

/**
 * Type guard to check if Result is Success
 */
export const isSuccess = <T, E>(result: Result<T, E>): result is Success<T> => {
  return result.success === true;
};

/**
 * Type guard to check if Result is Failure
 */
export const isFailure = <T, E>(result: Result<T, E>): result is Failure<E> => {
  return result.success === false;
};
