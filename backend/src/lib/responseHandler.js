// Success response handler
export const successResponse = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message,
    ...(data && { data }),
  };

  return res.status(statusCode).json(response);
};

// Error response handler
export const errorResponse = (res, statusCode, message, errors = null) => {
  const response = {
    success: false,
    message,
    ...(errors && { errors }),
  };

  return res.status(statusCode).json(response);
};

// Validation error handler
export const validationErrorResponse = (res, errors) => {
  const response = {
    success: false,
    message: "Validation failed",
    errors,
  };

  return res.status(400).json(response);
};

// Server error handler
export const serverErrorResponse = (res, message = "Internal server error") => {
  const response = {
    success: false,
    message,
  };

  return res.status(500).json(response);
};