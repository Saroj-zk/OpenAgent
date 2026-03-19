/**
 * Custom Error class for SAW API
 * Provides consistent error structure and status codes.
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true; // Distinguishes between operational and programming errors

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
