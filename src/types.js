/**
 * A custom error class to enhance default error with HTTP status code
 */
export class CustomError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}