export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class BadRequestError extends ApiError {
  constructor(message = 'Bad Request', stack = '') {
    super(400, message, true, stack);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized', stack = '') {
    super(401, message, true, stack);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden', stack = '') {
    super(403, message, true, stack);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Not Found', stack = '') {
    super(404, message, true, stack);
  }
}

export class InternalServerError extends ApiError {
  constructor(message = 'Internal Server Error', stack = '') {
    super(500, message, true, stack);
  }
}