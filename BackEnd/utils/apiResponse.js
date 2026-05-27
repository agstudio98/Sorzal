class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }

  static success(res, data, message = 'Success', code = 200) {
    return res.status(code).json(new ApiResponse(code, data, message));
  }

  static error(res, message = 'Error', code = 500, errors = null) {
    return res.status(code).json({
      statusCode: code,
      success: false,
      message,
      errors,
      stack: process.env.NODE_ENV === 'development' ? new Error().stack : undefined
    });
  }
}

module.exports = ApiResponse;
