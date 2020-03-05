/**
 * A custom error class to enhance default error with HTTP status code
 */
class CustomError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

module.exports.CustomError = CustomError;
