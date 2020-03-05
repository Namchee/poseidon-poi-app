/**
 * A custom error class to enhance default error with HTTP status code
 */
class CustomError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

module.exports.CustomError = CustomError;
